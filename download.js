
var https = require("https");
var resolve = require("path").resolve;
var fs = require("fs");
var os = require("os");
var TIMEOUT_DELAY = 2000;
var PERCENTAGE_INTERVAL = .1;
var crypto = require("crypto");

module.exports = function download(version, cb) {
  if (!version.sha256 && !process.env.DONT_WORRY_I_AM_BUILDING_A_NEW_VERSION) {
    throw new Error("Unknown SHA256 hash for this version " + JSON.stringify(version));
  }
  var filename = version.url.split("/").pop();
  process.stderr.write("Downloading " + filename + "... ");
  var outputPath = resolve(__dirname, filename);
  var outputStream = fs.createWriteStream(outputPath);
  var shasum = crypto.createHash("sha256");

  var err = function(message) {
    cb(new Error(message + " while trying to download " + filename + " from " + version.url));
  };

  var timeout = setTimeout(function() {
    cb(new Error("HTTP Timeout, waited " + TIMEOUT_DELAY + "ms."));
  }, TIMEOUT_DELAY);

  var lastUpdated = -PERCENTAGE_INTERVAL;

  https.get(version.url, function(res) {
    clearTimeout(timeout);
    if (res.statusCode !== 200) {
      return err("HTTP " + res.statusCode);
    }
    var size = 0;
    res.on("end", function() {
      // Make double-sure we're after the last "data"
      setTimeout(function() {
        process.stderr.write("Done!\n");
        var resultHash = shasum.digest("hex");
        if (version.sha256 && resultHash !== version.sha256) {
          fs.unlinkSync(outputPath);
          return err("SHA256 mismatch, expected " + version.sha256 + " got " + resultHash);
        }
        cb(null, {
          size: size,
          path: outputPath,
          sha256: resultHash,
        });
      }, 0);
    })
    .on("data", function(data) {
      shasum.update(data);
      size += data.length;
      if (version.size && ((size / version.size) - lastUpdated > PERCENTAGE_INTERVAL)) {
        lastUpdated = size / version.size;
        var percent = Math.round(lastUpdated * 100);
        process.stderr.write(percent + "% ");
      }
    })
    .pipe(outputStream);
  });
}

// If we're called directly, that means we're the download script. Let's go!
if (!module.parent) {
  var manifest = require("./manifest.json");
  var pkg = require("./package.json");
  var version = manifest.versions["v" + pkg.version];
  if (!version) {
    throw new Error("Unknown version of " + pkg.name + ": " + version);
  }
  var platform = os.platform();
  var arch = os.arch();
  var platArch = [platform, arch].join("-");
  if (!version[platArch]) {
    throw new Error(pkg.name + " doesn't appear to be available for platform/architecture " + platArch);
  }
  module.exports(version[platArch], function(err, data) {
    if (err) {
      console.error("error installing " + pkg.name + ": " + err, err.stack);
      process.exit(1);
    }
    fs.chmodSync(data.path, "0755");
    // Symlink for windows .exe files
    if (data.path.indexOf(".exe") === data.path.length - 4) {
      var newPath = data.path.slice(0, -4);
      fs.linkSync(data.path, newPath);
    }
  });
}
