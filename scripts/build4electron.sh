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
	_check_dependencies
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

_check_dependencies() {
	printf "Checking all dependencies.\n"
    if _command_exists node ; then
        printf "NodeJS found %s\n" $(node --version)
    else
        printf "NodeJS not found.\nTry run ./scripts/build4electron-setup.sh.\n"
        exit 1
    fi

    if _command_exists node-gyp ; then
        printf "node-gyp found %s\n" $(node-gyp --version)
    else
        printf "node-gyp not found.\nTry run ./scripts/build4electron-setup.sh.\n"
        exit 1
    fi

    if _command_exists yarn ; then
        printf "Yarn found %s\n" $(yarn --version)
    else
        printf "Yarn not found.\nTry run ./scripts/build4electron-setup.sh.\n"
        exit 1
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
