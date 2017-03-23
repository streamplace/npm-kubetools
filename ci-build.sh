#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$DIR"
git checkout master
git config --global user.name "Streamplace Robot"
git config --global user.email "stuff@stream.place"
npm install
npm config set unsafe-perm true
npm config set '//registry.npmjs.org/:_authToken' $NPM_TOKEN
npm run build-manifests

changes="$(git diff)"

# If anything changed, we need to update git
if [[ "$changes" == "" ]]; then
  exit 0
else
  set -x
  chmod 600 ~/.ssh/id_rsa
  git remote set-url origin 'git@github.com:streamplace/npm-kubetools.git'
  git add .
  git commit -m "$(date +%Y-%m-%d) auto-update"
  git push origin master
  npm run publish-all
fi
