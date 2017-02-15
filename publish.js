
var path = require("path");
var child = require("child_process");
var fs = require("fs");

var packageName = process.cwd().split("/").pop();

var pkgPath = path.resolve(__dirname, "packages", packageName, "package.json");

var manifest = require(path.resolve(__dirname, "packages", packageName, "manifest.json"));
var pkg = require(pkgPath);

var sortedTags = Object.keys(manifest.versions).sort().reverse();
var latestPrerelease = sortedTags[0];
var latest = sortedTags.filter(function(tag) {
  return tag.indexOf("-") === -1;
})[0];

Object.keys(manifest.versions).forEach(function(version) {
  var npmVersion = version.slice(1);
  var distTag;
  if (version === latest) {
    distTag = "latest";
  }
  else if (version === latestPrerelease) {
    distTag = "next";
  }
  else {
    distTag = "old";
  }
  pkg.version = npmVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), "utf8");
  var result = child.spawnSync("npm", ["publish", "--unsafe-perm", "--tag", distTag]);
  console.log(result.stdout.toString());
  console.log(result.stderr.toString());
});
