
// https://storage.googleapis.com/kubernetes-release/release/v1.5.2/bin/linux/amd64/kubectl

const kubePlatforms = {
  darwin: "darwin",
  linux: "linux",
  win32: "windows",
};

const kubeArchs = {
  arm: "arm",
  arm64: "arm64",
  ppc64: "ppc64le",
  s390x: "s390x",
  x64: "amd64",
  x86: "386",
};

module.exports.getUrl = function(version, platform, arch) {
  platform = kubePlatforms[platform];
  arch = kubeArchs[arch];
  var url = ([
    "https://storage.googleapis.com/kubernetes-release/release",
    version,
    "bin",
    platform,
    arch,
    "kubectl"
  ]).join("/");
  if (platform === "windows") {
    url += ".exe";
  }
  return url;
};
