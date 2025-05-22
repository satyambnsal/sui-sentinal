export PCR0=cf323bec50fd85db658dbf2687af3f3768e915259e60a37128cc86d4c851dfdd32d1ee10337f7d4c06e6eb3e740b74ed
export PCR1=cf323bec50fd85db658dbf2687af3f3768e915259e60a37128cc86d4c851dfdd32d1ee10337f7d4c06e6eb3e740b74ed
export PCR2=21b9efbc184807662e966d34f390821309eeac6802309798826296bf3e8bec7c10edb30948c90ba67310f7b964fc500a
export ENCLAVE_URL=http://54.81.11.64:3000
export MODULE_NAME=sentinel
export OTW_NAME=SENTINEL

echo "PCRS"
echo 0x$PCR0
echo 0x$PCR1
echo 0x$PCR2

echo "module name": $MODULE_NAME
echo "otw name": $OTW_NAME
echo "ENCLAVE_URL: " $ENCLAVE_URL

export ENCLAVE_PACKAGE_ID=0x4d475322e6e733d5306c1fafc046084c27b16ee011b9ace3bb6e9f0c3a88ccad

echo "ENCLAVE_PACKAGE_ID:" $ENCLAVE_PACKAGE_ID

export CAP_OBJECT_ID=0x5980e795b6492cd87aa6677eef41932263228b9b33e0443fe08c9f1b4ad75b55
export ENCLAVE_CONFIG_OBJECT_ID=0x6be9a371285edf87454170e871f430cabb9dd253ef73f51194887fdd98e3326e
export EXAMPLES_PACKAGE_ID=0x057874a5368987ba134f388a9283887f88670f6730af3d01c9a3bb4d8b9bb6ad
export AGENT_REGISTRY=0xebe58dadbc250211695411a09c4118e51cf83a8db1f418961298a87444f6a1fd

echo "CAP_OBJECT_ID:" $CAP_OBJECT_ID
echo "ENCLAVE_CONFIG_OBJECT_ID:" $ENCLAVE_CONFIG_OBJECT_ID
echo "AGENT_REGISTRY:" $AGENT_REGISTRY
echo "EXAMPLES_PACKAGE_ID": $EXAMPLES_PACKAGE_ID

# this calls the update_pcrs onchain with the enclave cap and built PCRs, this can be reused to update PCRs if Rust server code is updated
# sui client call --function update_pcrs --module enclave --package $ENCLAVE_PACKAGE_ID --type-args "$EXAMPLES_PACKAGE_ID::$MODULE_NAME::$OTW_NAME" --args $ENCLAVE_CONFIG_OBJECT_ID $CAP_OBJECT_ID 0x$PCR0 0x$PCR1 0x$PCR2

# # # this script calls the get_attestation endpoint from your enclave url and use it to calls register_enclave onchain to register the public key, results in the created enclave object
# sh register_enclave.sh $ENCLAVE_PACKAGE_ID $EXAMPLES_PACKAGE_ID $ENCLAVE_CONFIG_OBJECT_ID $ENCLAVE_URL $MODULE_NAME $OTW_NAME

export ENCLAVE_OBJECT_ID=0x5bc7b3dbe25f61535578e05b9c1979c197cf1962afff8d129de16483b1fd05d1

echo "ENCLAVE_OBJECT_ID:" $ENCLAVE_OBJECT_ID

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

sh consume_prompt.sh \
  $EXAMPLES_PACKAGE_ID \
  $MODULE_NAME \
  $OTW_NAME \
  $ENCLAVE_OBJECT_ID \
  "e10e3a321c918fb6a4be62f02829da3e45006066d5506d303489dff1ee6f0a57e28f1704c035139f65d84ed85e39cceb3f2a7de0075bd1cd499a06d98fc28500" \
  1747937756872 \
  "3" \
  $AGENT_REGISTRY
