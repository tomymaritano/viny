#!/bin/bash

# Script para build con firma y notarización
# Apple Developer Certificate configuration

export APPLE_ID="tomymaritano@gmail.com"
export APPLE_APP_SPECIFIC_PASSWORD="mskf-oqps-ojds-kwgm"
export APPLE_TEAM_ID="CB8LJYCJ3T"
export CSC_NAME="Developer ID Application: Tomas Maritano (CB8LJYCJ3T)"
export CSC_LINK="./vinyapp-certificate.cer"

echo "🍎 Configurando variables de Apple Developer..."
echo "APPLE_ID: $APPLE_ID"
echo "APPLE_TEAM_ID: $APPLE_TEAM_ID"
echo "CSC_NAME: $CSC_NAME"

echo "🔨 Iniciando build con firma..."
npm run build:electron