#!/usr/bin/env bash

set -o nounset
set -o errexit
set -o pipefail

DEFAULT_IFS="${IFS}"
SAFER_IFS=$'\n\t'
IFS="${SAFER_IFS}"

_ME=$(basename "${0}")

_print_help() {
  cat <<HEREDOC
Remote Pad - Install script

It install the latest (master) version of both projects,
Client and Server (Broker).

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
	_install_remote_pad
    _setup_production_client
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
    mkdir -p build
    cd build
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

    if _command_exists pm2 ; then
        printf "pm2 found %s\n" $(pm2 --version)
    else
        sudo npm install --global pm2
        printf "pm2 %s installed\n" $(pm2 --version)
    fi
}

_install_remote_pad() {
    declare -a arr=("remote-pad" "remote-pad-server")
    for project in "${arr[@]}"
    do
        printf "Installing %s\n" "$project"
        if [ -d "$project"-master ]
        then
            printf "%s alreary exists.\n" $project
        else
            printf "%s does not exists. Downloading ...\n" $project
            curl -Lo "$project".zip https://github.com/comsolid/"$project"/archive/master.zip
        	unzip -q "$project".zip
        fi
        cd "$project"-master
        yarn --ignore-optional
        cd -
    done
}

_setup_production_client() {
    cd remote-pad-master
    npm run build
    cd -
}

_setup_production_server() {
    # create credentials file
    cd remote-pad-server-master
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
    cd -
}

_command_exists() {
    type "$1" &> /dev/null ;
}

_end() {
    # go back
    cd -
    printf "Remote Pad installed and ready to run!\n"
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
