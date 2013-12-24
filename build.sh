#!/usr/bin/env bash
set -e

regenerator=$(npm bin)/regenerator
echo "* Removing old es5 files"
rm -rf ./lib/es5
mkdir ./lib/es5
echo "* Generating new es5 files"
$regenerator ./lib/yiewd.js > ./lib/es5/yiewd.js
cp ./lib/yiewd-element.js ./lib/es5/

echo "* Removing old es5 test files"
rm -rf ./test/es5
mkdir ./test/es5
echo "* Generating new es5 test files"
$regenerator ./test/es6/basic.js > ./test/es5/basic.js
$regenerator ./test/es6/element.js > ./test/es5/element.js
$regenerator ./test/es6/sauce.js > ./test/es5/sauce.js
