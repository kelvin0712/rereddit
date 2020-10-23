#!/bin/bash

echo What should the version be?
read VERSION

docker build -t kelvinnguyen/reredit:$VERSION .
docker push kelvinnguyen/reredit:$VERSION
# ssh root@64.227.13.208 "docker pull kelvinnguyen/reredit:$VERSION && docker tag kelvinnguyen/reredit:$VERSION dokku/api:$VERSION && dokku deploy api $VERSION"