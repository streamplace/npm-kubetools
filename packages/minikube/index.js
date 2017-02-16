
// https://github.com/kubernetes/minikube/releases/download/v0.16.0/minikube-darwin-amd64

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
    "https://github.com/kubernetes/minikube/releases/download",
    version,
    "minikube-" + platform + "-" + arch
  ]).join("/");
  return url;
};
