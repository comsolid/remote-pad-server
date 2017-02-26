#!/usr/bin/env bash
#
# Generates a version for use with remote-pad-gui (electron)
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

_install() {
    _init
	_install_dependencies
    _setup_production_server
    _end
}

_init() {
    arch=$(uname -m)
    if [ "$arch" != 'x86_64' ]
    then
        printf "Only supports x86_64. Your system is %s" $arch
        exit 1
    else
        printf "Architecture supported.\n"
    fi

    if [[ -d electron ]]; then
        echo "Removing previous build for electron..."
        rm -r electron
    fi
    git archive --prefix=electron/ -o electron.zip HEAD
    unzip electron.zip
    rm electron.zip
    cd electron
}

_install_dependencies() {
	printf "Installing all dependencies.\n"
    printf "It needs to install new software.\n"
    sudo apt-get --quiet update
    sudo apt-get --quiet -y install \
        curl \
        build-essential \
        libxtst-dev \
        libpng++-dev \
        libssl-dev
    if _command_exists node ; then
        printf "Node js found %s\n" $(node --version)
    else
        curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
        sudo apt-get install -y nodejs
        printf "Node js %s installed\n" $(node --version)
    fi

    if _command_exists node-gyp ; then
        printf "node-gyp found %s\n" $(node-gyp --version)
    else
        printf "Installing node-gyp\n"
        sudo npm install --global node-gyp
    fi

    if _command_exists yarn ; then
        printf "Yarn found %s\n" $(yarn --version)
    else
        curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
        echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
        sudo apt-get update
        sudo apt-get install yarn
        printf "Yarn %s installed\n" $(yarn --version)
    fi
}

_setup_production_server() {
    yarn install --ignore-optional
    npm rebuild --runtime=electron \
        --target=1.4.15 \
        --disturl=https://atom.io/download/atom-shell \
        --abi=48

    declare -a arr=("alice" "bob" "carol" "david")
    for player in "${arr[@]}"
    do
        ./node_modules/.bin/mosca adduser "$player" "$player" \
            --credentials ./credentials.json \
            --authorize-publish "*/$player" \
            --authorize-subscribe "*/$player"
    done

    ./node_modules/.bin/mosca adduser "gui" "gui" \
        --credentials ./credentials.json \
        --authorize-publish "gui/*" \
        --authorize-subscribe "gui/*"
}

_command_exists() {
    type "$1" &> /dev/null ;
}

_end() {
    # go back
    cd -
    printf "Remote Pad Server compiled to electron!\n"
}

_main() {
  # Avoid complex option parsing when only one program option is expected.
  if [[ "${1:-}" =~ ^-h|--help$  ]]
  then
    _print_help
  else
    _install "${@}"
  fi
}

# Call `_main` after everything has been defined.
_main "${@:-}"
