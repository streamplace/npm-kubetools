
var https = require("https");
var resolve = require("path").resolve;
var fs = require("fs");
var os = require("os");
var TIMEOUT_DELAY = 20000;
var PERCENTAGE_INTERVAL = .1;
var crypto = require("crypto");
var stream = require("stream");

function unTarGz(inputStream) {
  var zlib = require("zlib");
  var tar = require("tar");
  var ungz = zlib.createGunzip();
  inputStream.pipe(ungz);
  var untar = tar.Parse();
  ungz.pipe(untar);
  var pass = new stream.PassThrough();
  untar.on("entry", function(entry) {
    // Find the binary! This is gonna have to change if these projects ever use more than one.
    if (entry.props.size > 0 && entry.props.mode.toString(8) === "775") {
      entry.pipe(pass);
    }
  });
  return pass;
}

module.exports = function download(version, cb) {
  if (!version.sha256 && !process.env.DONT_WORRY_I_AM_BUILDING_A_NEW_VERSION) {
    throw new Error("Unknown SHA256 hash for this version " + JSON.stringify(version));
  }
  var filename = version.url.split("/").pop();
  process.stderr.write("Downloading " + filename + "... ");
  var outputPath = resolve(__dirname, filename);
  var shasum = crypto.createHash("sha256");
  var fileStream = fs.createWriteStream(outputPath);

  // Untar if necessary.
  var outputStream;
  if (filename.match(/.tar.gz$/)) {
    outputStream = new stream.PassThrough();
    unTarGz(outputStream, filename).pipe(fileStream);
  }
  else {
    outputStream = fileStream;
  }

  var err = function(message) {
    cb(new Error(message + " while trying to download " + filename + " from " + version.url));
  };

  var timeout = setTimeout(function() {
    cb(new Error("HTTP Timeout, waited " + TIMEOUT_DELAY + "ms."));
  }, TIMEOUT_DELAY);

  var lastUpdated = -PERCENTAGE_INTERVAL;

  var handleResponse = function(res) {
    clearTimeout(timeout);
    if (res.statusCode === 302 || res.statusCode === 301) {
      return https.get(res.headers.location, handleResponse);
    }
    else if (res.statusCode !== 200) {
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
  };

  https.get(version.url, handleResponse);
}

// If we're called directly, that means we're the download script. Let's go!
if (!module.parent) {
  var manifest = require("./manifest.json");
  var pkg = require("./package.json");
  var version = manifest.versions["v" + pkg.version];
  var desiredBinary = pkg.bin[Object.keys(pkg.bin)[0]];
  desiredBinary = resolve(__dirname, desiredBinary);
  var platform = os.platform();
  var arch = os.arch();
  if (!version) {
    throw new Error("Unknown version of " + pkg.name + ": " + version);
  }
  var platArch = [platform, arch].join("-");
  if (!version[platArch]) {
    throw new Error(pkg.name + " doesn't appear to be available for platform/architecture " + platArch);
  }
  module.exports(version[platArch], function(err, data) {
    if (err) {
      console.error("error installing " + pkg.name + ": " + err, err.stack);
      process.exit(1);
    }
    fs.renameSync(data.path, desiredBinary);
    fs.chmodSync(desiredBinary, "0755");
    // This handles windows .exe files
    if (platform === "win32") {
      var exe = desiredBinary + ".exe";
      try {
        fs.unlinkSync(exe);
      }
      catch (e) {
        if (e.code !== "ENOENT") {
          throw e;
        }
      }
      fs.linkSync(desiredBinary, exe);
    }
  });
}
