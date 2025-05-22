use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Agent {
    pub id: String,
    pub system_prompt: String,
    pub cost_per_message: u64,
    pub is_defeated: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterAgentRequest {
    pub system_prompt: String,
    pub cost_per_message: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RegisterAgentResponse {
    pub agent_id: String,
    pub cost_per_message: u64,
    pub system_prompt: String,
    pub is_defeated: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConsumePromptRequest {
    pub agent_id: String,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConsumePromptResponse {
    pub agent_id: String,
    pub user_prompt: String,
    pub success: bool,
    pub explanation: String,
    pub score: u8,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub error: String,
}
