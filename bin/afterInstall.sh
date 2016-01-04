#!/bin/bash

pushd .
cd /home/ec2-user/tsuyoku-api
#need the pushd and popd because codedeploy with cd
#will break the wholeagent
npm install
popd