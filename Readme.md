
# kubetools

Streamplace does a lot of Javascript things and a lot of Kubernetes things. It helps us to have
the Kubernetes CLI tools on npm, because that's how we handle dependencies in all of our
Javascript projects.

So, this project does that for the following Kubernetes-related projects:

* kubectl `npm install -g kubectl-cli`
* minikube `npm install -g minikube-cli`
* helm `npm install -g helm-cli`

If you find this useful, we'd love more tools!

## How it works?

This project publishes manifests for each of those tools (e.g. packages/kubectl/manifest.json)
that contain URLs and SHA256 hashes for each supported architecture/platform combination. It also
publishes `download.js` alongside them, which parses the version in `package.json` and downloads
the appropriate version from `manifest.json`.

## Auto-update

Once a day, Travis scrapes all the git tags on all of these repos and publishes new versions if any
exist. [The resulting commits look like this](https://github.com/streamplace/npm-kubetools/commit/81c073900143c169b1cc8634647f15655ec42f06). Inevitably someday this script will run
after the git tags are updated but before the new versions are published, and everything will probably
break. Hasn't happened yet though!

## Credits

[Eli](https://twitter.com/elimallon) made this as part of [Streamplace](https://stream.place).


# LICENSE

The license behind this project is MIT. The license behind all three tools is Apache-2.0.
test
