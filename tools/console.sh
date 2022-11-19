#!/bin/bash

starcoin -c /Users/xingyue/.starcoin/dev/starcoin.ipc console  <<EOF
account unlock
account unlock 0xc13ba46e31705e1a5b30bc0bfa564824 -p 1234
$*
exit
EOF
