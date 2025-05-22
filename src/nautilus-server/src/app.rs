// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

use crate::common::IntentMessage;
use crate::common::{to_signed_response, IntentScope, ProcessDataRequest, ProcessedDataResponse};
use crate::AppState;
use crate::EnclaveError;
use axum::extract::State;
use axum::{Json, response::IntoResponse};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Arc;
use uuid::Uuid;
use crate::{
    claude,
    models::{
        Agent, ConsumePromptRequest, ConsumePromptResponse, ErrorResponse, RegisterAgentRequest,
        RegisterAgentResponse,
    }
};



pub async fn register_agent(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<RegisterAgentRequest>,
) -> Result<Json<ProcessedDataResponse<IntentMessage<RegisterAgentResponse>>>, EnclaveError> {
    let agent_id = {
        let mut counter = state.agent_counter.write().await;
        *counter += 1;
        counter.to_string()
    };
    let current_timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| EnclaveError::GenericError(format!("Failed to get current timestamp: {}", e)))?
        .as_millis() as u64;

    let agent = Agent {
        id: agent_id.clone(),
        system_prompt: payload.system_prompt.clone(),
        cost_per_message: payload.cost_per_message,
        is_defeated: false,
    };
    
    let mut agents = state.agents.write().await;
    agents.insert(agent_id.clone(), agent);
    
    Ok(Json(to_signed_response(
        &state.eph_kp, 
        RegisterAgentResponse {
            agent_id: agent_id.to_string(),
            cost_per_message: payload.cost_per_message,
            system_prompt: payload.system_prompt,
            is_defeated: false,
        }, 
        current_timestamp, 
        IntentScope::RegisterAgent
    )))
}

pub async fn consume_prompt(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ConsumePromptRequest>,
) -> Result<Json<ProcessedDataResponse<IntentMessage<ConsumePromptResponse>>>, EnclaveError> {
    let agents = state.agents.write().await;

    let agent = match agents.get(&payload.agent_id) {
        Some(agent) => agent,
        None => {
            return Err(EnclaveError::GenericError(format!(
                "Agent with ID {} not found",
                payload.agent_id
            )));
        }
    };

    // Updated function call with agent_id parameter
    let evaluation = claude::evaluate_prompt(
        &payload.agent_id,
        &agent.system_prompt,
        &payload.message,
        &state.api_key
    )
    .await
    .unwrap_or_else(|_| ConsumePromptResponse {
        agent_id: payload.agent_id.clone(),
        success: false,
        explanation: "Failed to evaluate prompt".to_string(),
        score: 0,
    });


    // Get timestamp
    let current_timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| EnclaveError::GenericError(format!("Failed to get current timestamp: {}", e)))?
        .as_millis() as u64;

    let response = to_signed_response(
        &state.eph_kp,
        evaluation,
        current_timestamp,
        IntentScope::ConsumePrompt,
    );
    
    Ok(Json(response))
}




// #[cfg(test)]
// mod test {
//     use super::*;
//     use crate::common::IntentMessage;
//     use axum::{extract::State, Json};
//     use fastcrypto::{ed25519::Ed25519KeyPair, traits::KeyPair};

//     #[tokio::test]
//     async fn test_process_data() {
//         let state = Arc::new(AppState {
//             eph_kp: Ed25519KeyPair::generate(&mut rand::thread_rng()),
//             api_key: "045a27812dbe456392913223221306".to_string(),
//         });
//         let signed_weather_response = process_data(
//             State(state),
//             Json(ProcessDataRequest {
//                 payload: WeatherRequest {
//                     location: "San Francisco".to_string(),
//                 },
//             }),
//         )
//         .await
//         .unwrap();
//         assert_eq!(
//             signed_weather_response.response.data.location,
//             "San Francisco"
//         );
//     }

//     #[test]
//     fn test_serde() {
//         // test result should be consistent with test_serde in `move/enclave/sources/enclave.move`.
//         use fastcrypto::encoding::{Encoding, Hex};
//         let payload = WeatherResponse {
//             location: "San Francisco".to_string(),
//             temperature: 13,
//         };
//         let timestamp = 1744038900000;
//         let intent_msg = IntentMessage::new(payload, timestamp, IntentScope::Weather);
//         let signing_payload = bcs::to_bytes(&intent_msg).expect("should not fail");
//         assert!(
//             signing_payload
//                 == Hex::decode("0020b1d110960100000d53616e204672616e636973636f0d00000000000000")
//                     .unwrap()
//         );
//     }
// }
