#!/bin/bash

console.sh account execute-function --function 0xC13Ba46E31705e1A5B30Bc0BfA564824::MyCounter::init_counter -s 0xC13Ba46E31705e1A5B30Bc0BfA564824 -b
console.sh account execute-function --function 0xC13Ba46E31705e1A5B30Bc0BfA564824::MyCounter::incr_counter_by --arg 3 -s 0xC13Ba46E31705e1A5B30Bc0BfA564824 -b
console.sh state get resource 0xC13Ba46E31705e1A5B30Bc0BfA564824 0xC13Ba46E31705e1A5B30Bc0BfA564824::MyCounter::Counter