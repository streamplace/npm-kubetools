
var fs = require("fs");
var resolve = require("path").resolve;

var tools = fs.readdirSync(resolve(__dirname, "packages"));

tools.forEach(function (toolName) {
  var fileData = fs.readFileSync(resolve(__dirname, "packages", toolName, "manifest.json"), "utf8");
  var getUrl = require(resolve(__dirname, "packages", toolName)).getUrl;
  var manifest = JSON.parse(fileData);
  var tags = fs.readFileSync(resolve(__dirname, toolName + ".tags"), "utf8").trim().split("\n");

  // Make sure we have an object for each computer/platform/arch combo
  manifest.supported_computers.forEach(function(computer) {
    console.log(computer);
    var platform = computer.platform;
    var arch = computer.arch;
    tags.forEach(function(version) {
      var verTag = [version, platform, arch].join("-");
      if (manifest.versions[verTag] === undefined) {
        manifest.versions[verTag] = {
          url: getUrl(version, platform, arch),
        };
      }
    });
  });
  const outputStr = JSON.stringify(manifest, null, 2);
  fs.writeFileSync(resolve(__dirname, "packages", toolName, "manifest.json"), outputStr, "utf8")
});
