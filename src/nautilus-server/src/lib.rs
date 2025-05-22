// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
#![allow(warnings)]

use crate::models::Agent;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::response::Response;
use axum::Json;
use fastcrypto::ed25519::Ed25519KeyPair;
use serde_json::json;
use std::collections::HashMap;
use tokio::sync::RwLock;

pub mod app;
pub mod claude;
pub mod common;
pub mod models;

#[derive(Debug)]
pub struct AppState {
    pub eph_kp: Ed25519KeyPair,
    pub api_key: String,
    pub agents: RwLock<HashMap<String, Agent>>,
}

/// Implement IntoResponse for EnclaveError.
impl IntoResponse for EnclaveError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            EnclaveError::GenericError(e) => (StatusCode::BAD_REQUEST, e),
        };
        let body = Json(json!({
            "error": error_message,
        }));
        (status, body).into_response()
    }
}

/// Enclave errors enum.
#[derive(Debug)]
pub enum EnclaveError {
    GenericError(String),
}
