#!/usr/bin/env bash
#
# Setup build for electron
#

set -o nounset
set -o errexit
set -o pipefail

DEFAULT_IFS="${IFS}"
SAFER_IFS=$'\n\t'
IFS="${SAFER_IFS}"

_ME=$(basename "${0}")

_print_help() {
  cat <<HEREDOC
Remote Pad Server - compile to electron

Usage:
  ${_ME} [<arguments>]
  ${_ME} -h | --help
Options:
  -h --help  Show this screen.
HEREDOC
}

_setup() {
	printf "Installing all dependencies.\n"
    printf "It needs to install new software.\n"
    sudo apt-get --quiet update
    sudo apt-get --quiet -y install \
        curl \
        build-essential \
        libxtst-dev \
        libpng++-dev \
        libssl-dev

    curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
    sudo apt-get install -y nodejs
    printf "Node js %s installed\n" $(node --version)

    printf "Installing node-gyp\n"
    sudo npm install --global node-gyp

    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
    sudo apt-get update
    sudo apt-get install yarn
    printf "Yarn %s installed\n" $(yarn --version)
}

_main() {
  # Avoid complex option parsing when only one program option is expected.
  if [[ "${1:-}" =~ ^-h|--help$  ]]
  then
    _print_help
  else
    _setup "${@}"
  fi
}

# Call `_main` after everything has been defined.
_main "${@:-}"
