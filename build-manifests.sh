#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

git ls-remote --tags https://github.com/kubernetes/kubernetes.git \
  | sed 's/^.*tags\///' \
  | grep -v '{}' \
  > kubectl.tags;

git ls-remote --tags https://github.com/kubernetes/minikube.git \
  | sed 's/^.*tags\///' \
  | grep -v '{}' \
  > minikube.tags;

git ls-remote --tags https://github.com/kubernetes/helm.git \
  | sed 's/^.*tags\///' \
  | grep -v '{}' \
  > helm.tags;

node "$DIR/build-manifests.js"
