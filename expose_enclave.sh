# Copyright (c), Mysten Labs, Inc.
# SPDX-License-Identifier: Apache-2.0
#!/bin/bash

# Gets the encalve id and CID
# expects there to be only one enclave running
ENCLAVE_ID=$(nitro-cli describe-enclaves | jq -r ".[0].EnclaveID")
ENCLAVE_CID=$(nitro-cli describe-enclaves | jq -r ".[0].EnclaveCID")

sleep 5
# Secrets-block
SECRET_VALUE=$(aws secretsmanager get-secret-value --secret-id arn:aws:secretsmanager:us-east-1:402054803113:secret:API_KEY-tSacqO --region us-east-1 | jq -r .SecretString)
echo "$SECRET_VALUE" | jq -R '{"API_KEY": .}' > secrets.jsoncat secrets.json | socat - VSOCK-CONNECT:$ENCLAVE_CID:7777
socat TCP4-LISTEN:3000,reuseaddr,fork VSOCK-CONNECT:$ENCLAVE_CID:3000 &
socat TCP4-LISTEN:9184,reuseaddr,fork VSOCK-CONNECT:$ENCLAVE_CID:9184 &
socat TCP4-LISTEN:2025,reuseaddr,fork VSOCK-CONNECT:$ENCLAVE_CID:2025 &
