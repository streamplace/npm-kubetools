
//  https://storage.googleapis.com/kubernetes-helm/helm-v2.2.0-darwin-386.tar.gz

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
  var url = "https://storage.googleapis.com/kubernetes-helm/";
  url += ["helm", version, platform, arch].join("-");
  url += ".tar.gz";
  return url;
};
