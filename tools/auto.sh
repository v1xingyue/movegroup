#!/bin/bash

console.sh dev get-coin -v 100STC
console.sh account execute-function --function 0x1::TransferScripts::peer_to_peer_v2 -t 0x1::STC::STC --arg $1 --arg 10000000000u128 
