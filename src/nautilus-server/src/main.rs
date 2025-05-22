// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
#![allow(warnings)]

use anyhow::Result;
use dotenvy::dotenv;
use std::env;
use axum::{routing::get, routing::post, Router};
use fastcrypto::{ed25519::Ed25519KeyPair, traits::KeyPair};
use nautilus_server::app::{register_agent, consume_prompt};
use nautilus_server::common::{get_attestation, health_check};
use nautilus_server::AppState;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tracing::info;
use std::collections::HashMap;
use tokio::sync::RwLock;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};


#[tokio::main]
async fn main() -> Result<()> {

    dotenv().ok();
        tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();
    let eph_kp = Ed25519KeyPair::generate(&mut rand::thread_rng());

    let api_key = std::env::var("API_KEY").expect("API_KEY must be set");
     println!("API_KEY = {}", api_key);

    let state = Arc::new(AppState { eph_kp, api_key, agents: RwLock::new(HashMap::new()), agent_counter: RwLock::new(0) });

    // Define your own restricted CORS policy here if needed.
    let cors = CorsLayer::new().allow_methods(Any).allow_headers(Any);

    let app = Router::new()
        .route("/", get(ping))
        .route("/get_attestation", get(get_attestation))
        .route("/register-agent", post(register_agent))
        .route("/consume-prompt", post(consume_prompt))
        .route("/health_check", get(health_check))
        .with_state(state)
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    info!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app.into_make_service())
        .await
        .map_err(|e| anyhow::anyhow!("Server error: {}", e))
}

async fn ping() -> &'static str {
    "Pong!"
}
