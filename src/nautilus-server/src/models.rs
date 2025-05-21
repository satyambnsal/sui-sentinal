use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Agent {
    pub id: Uuid,
    pub prompt: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterAgentRequest {
    pub prompt: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RegisterAgentResponse {
    pub agent_id: Uuid,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConsumePromptRequest {
    pub agent_id: Uuid,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConsumePromptResponse {
    pub success: bool,
    pub explanation: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub score: Option<u8>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub error: String,
}
