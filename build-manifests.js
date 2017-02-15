
var fs = require("fs");
var resolve = require("path").resolve;
var download = require("./download");

var tools = fs.readdirSync(resolve(__dirname, "packages"));

tools.forEach(function (toolName) {

  var manifestPath = resolve(__dirname, "packages", toolName, "manifest.json");
  var fileData = fs.readFileSync(manifestPath);
  var manifest = JSON.parse(fileData);

  var save = function() {
    console.log("Saving " + manifestPath);
    var outputStr = JSON.stringify(manifest, null, 2);
    fs.writeFileSync(manifestPath, outputStr, "utf8");
  };

  var getUrl = require(resolve(__dirname, "packages", toolName)).getUrl;
  var tags = fs.readFileSync(resolve(__dirname, toolName + ".tags"), "utf8").trim().split("\n");

  // Make sure we have an object for each computer/platform/arch combo
  manifest.supported_computers.forEach(function(computer) {
    var platform = computer.platform;
    var arch = computer.arch;
    tags.forEach(function(version) {
      var verTag = [version, platform, arch].join("-");
      if (manifest.versions[verTag] === undefined) {
        manifest.versions[verTag] = {};
      }
      // If null, we've determined this is a bum pair
      if (manifest.versions[verTag] === null) {
        return;
      }
      manifest.versions[verTag].url = getUrl(version, platform, arch);
    });
  });

  save();

  const getInfo = function(version) {
    download(version, function(err, data) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      version.size = data.size;
      version.sha256 = data.sha256;
      save();
    });
  };

  var versionsToFix = [];
  Object.keys(manifest.versions).forEach(function(versionTag) {
    var version = manifest.versions[versionTag];
    if (!manifest.sha256) {
      versionsToFix.push(version);
    }
  });

  getInfo(manifest.versions[Object.keys(manifest.versions)[0]]);
});
