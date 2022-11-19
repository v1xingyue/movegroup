#!/bin/bash 

mpm release 
blob_path=$(ls release/*.blob)
console.sh dev deploy $blob_path -s 0xC13Ba46E31705e1A5B30Bc0BfA564824 -b