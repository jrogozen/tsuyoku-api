#!/bin/bash

. parse_yaml.sh

eval $(parse_yaml ../../config/env.yml "config_")

$config_jwt_secret
$config_port
$config_production_db

sudo NODE_ENV=production JWT_SECRET="$config_jwt_secret" PORT="$config_port" PRODUCTION_DB="$config_production_db" forever start index.js
