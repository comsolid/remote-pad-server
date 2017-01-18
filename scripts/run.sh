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
Remote Pad - Run script

Starts the server and client in production mode, using pm2.

Usage:
  ${_ME} [<arguments>]
  ${_ME} -h | --help
Options:
  -h --help  Show this screen.
HEREDOC
}

_run() {
    if _command_exists pm2 ; then
        printf "pm2 found %s\n" $(pm2 --version)
        cd build/remote-pad-master
        pm2 start production/process.yml
        cd -
        cd build/remote-pad-server-master
        pm2 start process.yml
        cd -
        printf "\nRun 'pm2 monit' to monitor the apps...\n\n"
        ip_address=$(ip route get 1 | awk '{print $NF;exit}')
        printf "Client - open your browser at %s:8080\n\n" $ip_address
        printf "Server - WebSocket is listening at %s:1884\n" $ip_address
    else
        printf "pm2 not found.\n"
        printf "Make sure you have executed setup first.\n"
        exit 1
    fi
}

_command_exists() {
    type "$1" &> /dev/null ;
}

_main() {
  # Avoid complex option parsing when only one program option is expected.
  if [[ "${1:-}" =~ ^-h|--help$  ]]
  then
    _print_help
  else
    _run "${@}"
  fi
}

# Call `_main` after everything has been defined.
_main "${@:-}"
