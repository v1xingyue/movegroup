#!/bin/zsh

export PATH="$PATH:`pwd`/starcoin-artifacts/:`pwd`/tools:"
export PS1='starcoin-dev $(pwd) $ '

alias starconsole="starcoin -c ${HOME}.starcoin/dev/starcoin.ipc console"