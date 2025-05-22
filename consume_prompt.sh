#!/bin/bash

# Check if all args are provided
if [ "$#" -ne 8 ]; then
  echo "Usage: $0 <examples_package_id> <module_name> <otw_name> <enclave_object_id> <signature_hex> <timestamp_ms> <agent-id>"
  echo "Example: $0 0x2b70e34684d696a0a2847c793ee1e5b88a23289a7c04dd46249b95a9823367d9 sentinel SENTINEL 0x5fc237c75757e47c5819b3f25bab6acc6c45c39db320a109e12c8c4468103438 bb0d315f8904f298288249c5d4498cb4904dad07f1ab149e59c7d0d1d39f5865fabc40f1cc927248fe6e381417fedbdb0d9df76eee86493977d347fdfe998e00 1743982200000 'San Francisco'"
  exit 1
fi

EXAMPLES_PACKAGE_ID=$1
MODULE_NAME=$2
OTW_NAME=$3
ENCLAVE_OBJECT_ID=$4
SIG_HEX=$5
TIMESTAMP_MS=$6
AGENT_ID=$7
AGENT_REGISTRY=$8
SCORE=62
SUCCESS=true
EXPLANATION="This attack attempts to exploit potential vulnerabilities in the agents protocols and emergency procedures By referencin"
AGENT_OBJECT_ID=0x78163d608aab2f0a28b597cabba2fdcc3e3586c2953ad1d623c35e2b75c03041

echo "package id": $EXAMPLES_PACKAGE_ID
echo "module name": $MODULE_NAME
echo "otw name": $OTW_NAME
echo "enclave obhect id" $ENCLAVE_OBJECT_ID
echo "sig hex": $SIG_HEX
echo "timestamp:" $TIMESTAMP_MS
echo "agebt id" $AGENT_ID
echo "agent registry" $AGENT_REGISTRY
echo "score" $SCORE
echo "success" $SUCCESS
echo "user prompt: " $USER_PROMPT
echo "Explanation: " $EXPLANATION
echo "AGENT Object ID: " $AGENT_OBJECT_ID

# Convert hex to vector array using Python
SIG_ARRAY=$(
  python3 - <<EOF
import sys

def hex_to_vector(hex_string):
    byte_values = [str(int(hex_string[i:i+2], 16)) for i in range(0, len(hex_string), 2)]
    rust_array = [f"{byte}u8" for byte in byte_values]
    return f"[{', '.join(rust_array)}]"

print(hex_to_vector("$SIG_HEX"))
EOF
)

echo "converted sig, length=${#SIG_ARRAY}"

sui client ptb \
  --move-call "${EXAMPLES_PACKAGE_ID}::sentinel::consume_prompt<${EXAMPLES_PACKAGE_ID}::${MODULE_NAME}::${OTW_NAME}>" \
  @$AGENT_REGISTRY \
  @$AGENT_OBJECT_ID \
  "\"$AGENT_ID\"" \
  $SUCCESS \
  "\"$EXPLANATION\"" \
  $SCORE \
  $TIMESTAMP_MS \
  "vector$SIG_ARRAY" \
  @$ENCLAVE_OBJECT_ID \
  --gas-budget 100000000
