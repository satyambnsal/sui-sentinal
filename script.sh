export PCR0=0ddbfd967739e04b8ff9985a802db12d62ed1254af3fc71d33b66070d51860f42d7076b89281cc024f842bca5237cf6e
export PCR1=0ddbfd967739e04b8ff9985a802db12d62ed1254af3fc71d33b66070d51860f42d7076b89281cc024f842bca5237cf6e
export PCR2=21b9efbc184807662e966d34f390821309eeac6802309798826296bf3e8bec7c10edb30948c90ba67310f7b964fc500a
export ENCLAVE_URL=http://3.92.163.15:3000
export MODULE_NAME=sentinel
export OTW_NAME=SENTINEL

echo "PCRS"
echo 0x$PCR0
echo 0x$PCR1
echo 0x$PCR2

echo "module name": $MODULE_NAME
echo "otw name": $OTW_NAME
echo "ENCLAVE_URL: " $ENCLAVE_URL

export ENCLAVE_PACKAGE_ID=0x2970fb37fb8327d7e4731ebf68813a83a1a5ed2ca2041ddba73d2a2956e418ff

echo "ENCLAVE_PACKAGE_ID:" $ENCLAVE_PACKAGE_ID

export CAP_OBJECT_ID=0xa6878c9b12e0783e84cbd82526970b3bfbc46ade9d8ba7149c308bc2e4edd84b
export ENCLAVE_CONFIG_OBJECT_ID=0xfae50a84da2d964552e18bd1a1ea2ecb1ba54cba2e6d340b6a5d0270c7099ccb
export EXAMPLES_PACKAGE_ID=0xe66533e7317be1f38ba0bdde5b58d000f6330cc06d31c4bbf3f22709eac13001
export AGENT_REGISTRY=0x6eea1a6fd3fbf870a043f311ad260c0dc6f384f3c869dd4ccfa550c2202bc485

echo "CAP_OBJECT_ID:" $CAP_OBJECT_ID
echo "ENCLAVE_CONFIG_OBJECT_ID:" $ENCLAVE_CONFIG_OBJECT_ID
echo "AGENT_REGISTRY:" $AGENT_REGISTRY
echo "EXAMPLES_PACKAGE_ID": $EXAMPLES_PACKAGE_ID

# this calls the update_pcrs onchain with the enclave cap and built PCRs, this can be reused to update PCRs if Rust server code is updated
# sui client call --function update_pcrs --module enclave --package $ENCLAVE_PACKAGE_ID --type-args "$EXAMPLES_PACKAGE_ID::$MODULE_NAME::$OTW_NAME" --args $ENCLAVE_CONFIG_OBJECT_ID $CAP_OBJECT_ID 0x$PCR0 0x$PCR1 0x$PCR2

# # # this script calls the get_attestation endpoint from your enclave url and use it to calls register_enclave onchain to register the public key, results in the created enclave object
# sh register_enclave.sh $ENCLAVE_PACKAGE_ID $EXAMPLES_PACKAGE_ID $ENCLAVE_CONFIG_OBJECT_ID $ENCLAVE_URL $MODULE_NAME $OTW_NAME

export ENCLAVE_OBJECT_ID=0xb1eda22ce9f778835f1c14f513a3b849aad3a1f76074839de5cf4b2121f2804e

# echo "ENCLAVE_OBJECT_ID:" $ENCLAVE_OBJECT_ID

# sh register_agent.sh \
#   $EXAMPLES_PACKAGE_ID \
#   $MODULE_NAME \
#   $OTW_NAME \
#   $ENCLAVE_OBJECT_ID \
#   "11b59e066aa41bfed2e39d455acb63e8196ead1aca555afbd2b259b85f88045fbabc5257e04313ff624e813ff0f257b2735b2d53a98742b5edf0f61d7b54130e" \
#   1747937545289 \
#   "3" \
#   $AGENT_REGISTRY \
#   1 \
#   "0x123"

# sh consume_prompt.sh \
#   $EXAMPLES_PACKAGE_ID \
#   $MODULE_NAME \
#   $OTW_NAME \
#   $ENCLAVE_OBJECT_ID \
#   "e10e3a321c918fb6a4be62f02829da3e45006066d5506d303489dff1ee6f0a57e28f1704c035139f65d84ed85e39cceb3f2a7de0075bd1cd499a06d98fc28500" \
#   1747937756872 \
#   "3" \
#   $AGENT_REGISTRY
