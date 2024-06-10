#!/bin/bash
VERSION="$1"
if [ $# -eq 0 ]
  then
    echo "No version supplied, please run script like 'tag.sh 0.5.0"
    exit
fi


#git submodule foreach git tag -m "new release" v$VERSION
git tag -a v$VERSION -m "new release"
git submodule foreach git push origin --tags
git push origin --tags
