#!/bin/bash

console.sh account execute-function --function 0x1::TransferScripts::peer_to_peer_v2 -t 0x1::STC::STC --arg $1 --arg 100000000000u128 