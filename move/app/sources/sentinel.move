// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#[allow(unused_field, unused_const, unused_use)]

module app::sentinel;

use enclave::enclave::{Self, Enclave};
use std::string::String;
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::balance::{Self, Balance};
use sui::table::{Self, Table};
use sui::vec_map::{Self, VecMap};
use sui::event;
use sui::transfer;
use sui::object::{Self, UID, ID};
use std::bool;


const SENTINEL_INTENT: u8 = 1;
const CONSUME_PROMPT_INTENT: u8 = 2;

const EInvalidSignature: u64 = 1;
const EAgentNotFound: u64 = 2;
const EInsufficientBalance: u64 = 3;
const EInvalidAmount: u64 = 4;
const ELowScore: u64 = 5;
const ENotAuthorized: u64 = 6;


public struct Agent has key, store {
    id: UID,
    agent_id: String,
    creator: address,
    cost_per_message: u64,
    system_prompt: String,
    balance: Balance<SUI>
}


public struct AgentInfo has copy, drop {
    agent_id: String,
    creator: address,
    cost_per_message: u64,
    system_prompt: String,
    object_id: ID,
    balance: u64
}

public struct AgentRegistry has key {
    id: UID,
    agents: Table<String, ID>,
    agent_list: vector<String>,
}


public struct SENTINEL has drop {}


public struct AgentCap has key, store {
    id: UID,
    agent_id: String,
}


public struct RegisterAgentResponse has copy, drop {
    agent_id: String,
    cost_per_message: u64,
    system_prompt: String,
    is_defeated: bool
}


public struct ConsumePromptResponse has copy, drop {
    agent_id: String,
    success: bool,
    explanation: String,
    score: u8
}


public struct AgentRegistered has copy, drop {
    agent_id: String,
    prompt: String,
    creator: address,
    cost_per_message: u64,
    initial_balance: u64,
    agent_object_id: ID,
}

public struct PromptConsumed has copy, drop {
    agent_id: String,
    success: bool,
    amount: u64,
    sender: address,
}

public struct FeeTransferred has copy, drop {
    agent_id: String,
    creator: address,
    amount: u64,
}

public struct AgentFunded has copy, drop {
    agent_id: String,
    amount: u64,
}

public struct AgentDefeated has copy, drop {
    agent_id: String,
    winner: address,
    score: u8,
    amount_won: u64,
}


fun init(otw: SENTINEL, ctx: &mut TxContext) {
    // Initialize enclave configuration
    let cap = enclave::new_cap(otw, ctx);

    cap.create_enclave_config(
        b"sentinel enclave".to_string(),
        x"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", // pcr0
        x"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", // pcr1
        x"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", // pcr2
        ctx,
    );

    transfer::public_transfer(cap, ctx.sender());
    
    // Create and share the agent registry
    let registry = AgentRegistry {
        id: object::new(ctx),
        agents: table::new(ctx),
        agent_list: vector::empty<String>(),
    };
    transfer::share_object(registry);
}

/// Register a new agent with its prompt, cost per message, and initial funds
#[allow(lint(self_transfer))]
public fun register_agent<T>(
    registry: &mut AgentRegistry,
    agent_id: String,
    timestamp_ms: u64,
    cost_per_message: u64,
    system_prompt: String,
    sig: &vector<u8>,
    enclave: &Enclave<T>,
    ctx: &mut TxContext,
) {
    let creator = ctx.sender();
    
    let res = enclave::verify_signature<T, RegisterAgentResponse>(enclave, SENTINEL_INTENT, timestamp_ms, RegisterAgentResponse { agent_id, cost_per_message, system_prompt, is_defeated:false }, sig);
    assert!(res, EInvalidSignature);
    

    let agent = Agent {
        id: object::new(ctx),
        agent_id,
        creator,
        cost_per_message,
        system_prompt,
        balance: balance::zero(), 
    };
    
    let agent_object_id = object::id(&agent);
    table::add(&mut registry.agents, agent_id, agent_object_id);
    
    vector::push_back(&mut registry.agent_list, agent_id);
    
    event::emit(AgentRegistered {
        agent_id,
        prompt: system_prompt,
        creator,
        cost_per_message,
        initial_balance: 0,
        agent_object_id,
    });
    transfer::share_object(agent);
}

public fun fund_agent(agent: &mut Agent, payment: Coin<SUI>, ctx: &TxContext) {
    let amount = coin::value(&payment);
    let balance_to_add = coin::into_balance(payment);
    balance::join(&mut agent.balance, balance_to_add);
    
    event::emit(AgentFunded {
        agent_id: agent.agent_id,
        amount,
    });
}

public fun consume_prompt<T>(
    registry: &AgentRegistry,
    agent: &mut Agent,
    agent_id: String,
    success: bool,
    explanation: String,
    score: u8,
    timestamp_ms: u64,
    sig: &vector<u8>,
    enclave: &Enclave<T>,
    ctx: &mut TxContext,
) {
    // Verify the agent exists in registry and matches the provided agent object
    assert!(table::contains(&registry.agents, agent_id), EAgentNotFound);
    let registered_agent_id = *table::borrow(&registry.agents, agent_id);
    assert!(object::id(agent) == registered_agent_id, EAgentNotFound);
    assert!(agent.agent_id == agent_id, EAgentNotFound);
    
    // Verify signature
    let response = ConsumePromptResponse {
        agent_id,
        success,
        explanation,
        score
    };
    
    let verification_result = enclave::verify_signature<T, ConsumePromptResponse>(
        enclave, 
        CONSUME_PROMPT_INTENT, 
        timestamp_ms, 
        response, 
        sig
    );
    assert!(verification_result, EInvalidSignature);
    
    let caller = ctx.sender();
    
    // Emit event for prompt consumption
    event::emit(PromptConsumed {
        agent_id,
        success,
        amount: 0, // Will be updated if agent is defeated
        sender: caller,
    });
    
    // Check if agent is defeated (score > 70 OR success)
    if (score > 70 || success) {
        let agent_balance = balance::value(&agent.balance);
        
        if (agent_balance > 0) {
            // Transfer all funds from agent to caller
            let withdrawn_balance = balance::withdraw_all(&mut agent.balance);
            let reward_coin = coin::from_balance(withdrawn_balance, ctx);
            
            // Transfer the reward directly to the caller
            transfer::public_transfer(reward_coin, caller);
            
            event::emit(AgentDefeated {
                agent_id,
                winner: caller,
                score,
                amount_won: agent_balance,
            });
        }
    }
}

public fun get_agent_info(agent: &Agent): AgentInfo {
    AgentInfo {
        agent_id: agent.agent_id,
        creator: agent.creator,
        cost_per_message: agent.cost_per_message,
        system_prompt: agent.system_prompt,
        object_id: object::id(agent),
        balance: balance::value(&agent.balance),
    }
}

public fun get_all_agent_ids(registry: &AgentRegistry): vector<String> {
    registry.agent_list
}

/// Get the total number of agents in the registry
public fun get_agent_count(registry: &AgentRegistry): u64 {
    vector::length(&registry.agent_list)
}

/// Check if an agent exists in the registry
public fun agent_exists(registry: &AgentRegistry, agent_id: String): bool {
    table::contains(&registry.agents, agent_id)
}

/// Get agent object ID by agent_id
public fun get_agent_object_id(registry: &AgentRegistry, agent_id: String): Option<ID> {
    if (table::contains(&registry.agents, agent_id)) {
        option::some(*table::borrow(&registry.agents, agent_id))
    } else {
        option::none()
    }
}

/// Get agent details from the Agent object (when you have access to it)
public fun get_agent_details(agent: &Agent): (String, address, u64, String, u64) {
    (agent.agent_id, agent.creator, agent.cost_per_message, agent.system_prompt, balance::value(&agent.balance))
}

/// Get agent balance
public fun get_agent_balance(agent: &Agent): u64 {
    balance::value(&agent.balance)
}

/// Update agent cost per message (only by creator)
public fun update_agent_cost(agent: &mut Agent, new_cost: u64, ctx: &TxContext) {
    assert!(agent.creator == ctx.sender(), ENotAuthorized);
    agent.cost_per_message = new_cost;
}

/// Update agent system prompt (only by creator)
public fun update_agent_prompt(agent: &mut Agent, new_prompt: String, ctx: &TxContext) {
    assert!(agent.creator == ctx.sender(), ENotAuthorized);
    agent.system_prompt = new_prompt;
}

/// Withdraw funds from agent (only by creator, and only if agent is not defeated)
public fun withdraw_from_agent(agent: &mut Agent, amount: u64, ctx: &mut TxContext): Coin<SUI> {
    assert!(agent.creator == ctx.sender(), ENotAuthorized);
    assert!(balance::value(&agent.balance) >= amount, EInsufficientBalance);
    
    let withdrawn_balance = balance::split(&mut agent.balance, amount);
    coin::from_balance(withdrawn_balance, ctx)
}

#[test]
fun test_register_agent_flow() {
    use sui::test_scenario::{Self, ctx, next_tx};
    use sui::nitro_attestation;
    use sui::test_utils::destroy;
    use enclave::enclave::{register_enclave, create_enclave_config, update_pcrs, EnclaveConfig};

    let mut scenario = test_scenario::begin(@0x1);
    let mut clock = sui::clock::create_for_testing(scenario.ctx());
    clock.set_for_testing(1744684007462);

    let cap = enclave::new_cap(SENTINEL {}, scenario.ctx());
    cap.create_enclave_config(
        b"sentinel enclave".to_string(),
        x"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        x"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        x"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        scenario.ctx(),
    );

    scenario.next_tx(@0x1);

    let mut config = scenario.take_shared<EnclaveConfig<SENTINEL>>();

    config.update_pcrs(
        &cap,
        x"cbe1afb6ed0ff89f10295af0b802247ec5670da8f886e71a4226373b032c322f4e42c9c98288e7211682b258684505a2",
        x"cbe1afb6ed0ff89f10295af0b802247ec5670da8f886e71a4226373b032c322f4e42c9c98288e7211682b258684505a2",
        x"21b9efbc184807662e966d34f390821309eeac6802309798826296bf3e8bec7c10edb30948c90ba67310f7b964fc500a",
    );

    scenario.next_tx(@0x1);
    let payload =
        x"8444a1013822a0591120a9696d6f64756c655f69647827692d30366534623938633635343966663830332d656e633031393633373362313935666237323366646967657374665348413338346974696d657374616d701b000001963743f8f06470637273b0005830cbe1afb6ed0ff89f10295af0b802247ec5670da8f886e71a4226373b032c322f4e42c9c98288e7211682b258684505a2015830cbe1afb6ed0ff89f10295af0b802247ec5670da8f886e71a4226373b032c322f4e42c9c98288e7211682b258684505a202583021b9efbc184807662e966d34f390821309eeac6802309798826296bf3e8bec7c10edb30948c90ba67310f7b964fc500a0358309af4960cd10ff0ddb81dc6660d16bf92165923d7ce3cbc53b9e42257424049b55bf459ca68ba632f39ff510064293c5f045830f3e18816e8d0ba69088d034522e742f0e1909ab34d5e83a1f579ffb43c58f0f0f35d64401efc9426097565d0506a8a5f0558300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000658300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000758300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000858300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000958300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a58300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b58300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c58300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d58300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e58300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f58300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006b636572746966696361746559027f3082027b30820201a00302010202100196373b195fb7230000000067fdc1ce300a06082a8648ce3d04030330818e310b30090603550406130255533113301106035504080c0a57617368696e67746f6e3110300e06035504070c0753656174746c65310f300d060355040a0c06416d617a6f6e310c300a060355040b0c034157533139303706035504030c30692d30366534623938633635343966663830332e75732d656173742d312e6177732e6e6974726f2d656e636c61766573301e170d3235303431353032313734375a170d3235303431353035313735305a308193310b30090603550406130255533113301106035504080c0a57617368696e67746f6e3110300e06035504070c0753656174746c65310f300d060355040a0c06416d617a6f6e310c300a060355040b0c03415753313e303c06035504030c35692d30366534623938633635343966663830332d656e63303139363337336231393566623732332e75732d656173742d312e6177733076301006072a8648ce3d020106052b8104002203620004490136a3059279a6f8632e540e52ed40f92f891fedf5bdfbbddc3ec066bdbe0f45e0c3e8b07e689a8c3ad57f940181b8a7d8940772290efc58e56d1a9fcc50a969e55ec546e325c09d22c9eb1ed581dd00c70e184368b2330e7ef4b94d3f3833a31d301b300c0603551d130101ff04023000300b0603551d0f0404030206c0300a06082a8648ce3d0403030368003065023100d6d67e427ae4d86ba2f9d7848aba398d89271decf60d772fb8f68a95e01aedfdfa1dc46d0e7c65d42c8328af205cfc02023037bdff62ac37852595143477c8cdf43937c4b56e7165256017c9aa6083cbe6e99365cf38c3984e2e7450d1578293f3c668636162756e646c65845902153082021130820196a003020102021100f93175681b90afe11d46ccb4e4e7f856300a06082a8648ce3d0403033049310b3009060355040613025553310f300d060355040a0c06416d617a6f6e310c300a060355040b0c03415753311b301906035504030c126177732e6e6974726f2d656e636c61766573301e170d3139313032383133323830355a170d3439313032383134323830355a3049310b3009060355040613025553310f300d060355040a0c06416d617a6f6e310c300a060355040b0c03415753311b301906035504030c126177732e6e6974726f2d656e636c617665733076301006072a8648ce3d020106052b8104002203620004fc0254eba608c1f36870e29ada90be46383292736e894bfff672d989444b5051e534a4b1f6dbe3c0bc581a32b7b176070ede12d69a3fea211b66e752cf7dd1dd095f6f1370f4170843d9dc100121e4cf63012809664487c9796284304dc53ff4a3423040300f0603551d130101ff040530030101ff301d0603551d0e041604149025b50dd90547e796c396fa729dcf99a9df4b96300e0603551d0f0101ff040403020186300a06082a8648ce3d0403030369003066023100a37f2f91a1c9bd5ee7b8627c1698d255038e1f0343f95b63a9628c3d39809545a11ebcbf2e3b55d8aeee71b4c3d6adf3023100a2f39b1605b27028a5dd4ba069b5016e65b4fbde8fe0061d6a53197f9cdaf5d943bc61fc2beb03cb6fee8d2302f3dff65902c2308202be30820245a003020102021100aca2293d4cf500edd86a7bd187ba1338300a06082a8648ce3d0403033049310b3009060355040613025553310f300d060355040a0c06416d617a6f6e310c300a060355040b0c03415753311b301906035504030c126177732e6e6974726f2d656e636c61766573301e170d3235303431313136333235355a170d3235303530313137333235355a3064310b3009060355040613025553310f300d060355040a0c06416d617a6f6e310c300a060355040b0c034157533136303406035504030c2d356139363331373264336535616338622e75732d656173742d312e6177732e6e6974726f2d656e636c617665733076301006072a8648ce3d020106052b810400220362000490c21b3f525af903e794663217497520278d2139f1d1a0b20eb8ff5355c8aed6ac269cea960f70493d0a4133b6cba128c820e80f40864bc032ac9b818e45c587f53d07eafc78fb530b2a1869858e55ef33c8e61e2dc6f370a308ad65d94ed1eea381d53081d230120603551d130101ff040830060101ff020102301f0603551d230418301680149025b50dd90547e796c396fa729dcf99a9df4b96301d0603551d0e04160414add2c2173808b510358d217b3b86fb8f1ad6b173300e0603551d0f0101ff040403020186306c0603551d1f046530633061a05fa05d865b687474703a2f2f6177732d6e6974726f2d656e636c617665732d63726c2e73332e616d617a6f6e6177732e636f6d2f63726c2f61623439363063632d376436332d343262642d396539662d3539333338636236376638342e63726c300a06082a8648ce3d040303036700306402300249f3400cd372979e8b38574f68abb0c09985ebba87d6ff7ed39565b5d60cf1219e5148ac25ec631730542aebd5c5810230615675a1d4841c819082db134b1717eb4b6676c812f09130b1cfe7a9f62a02a072b5c336425a14fbbd1d80d74b356b85590319308203153082029ba003020102021100969362d18653a5d07019712d46af35ca300a06082a8648ce3d0403033064310b3009060355040613025553310f300d060355040a0c06416d617a6f6e310c300a060355040b0c034157533136303406035504030c2d356139363331373264336535616338622e75732d656173742d312e6177732e6e6974726f2d656e636c61766573301e170d3235303431353030323331395a170d3235303432303138323331395a308189313c303a06035504030c33613833653764313231306434313335632e7a6f6e616c2e75732d656173742d312e6177732e6e6974726f2d656e636c61766573310c300a060355040b0c03415753310f300d060355040a0c06416d617a6f6e310b3009060355040613025553310b300906035504080c0257413110300e06035504070c0753656174746c653076301006072a8648ce3d020106052b81040022036200048d5a8ecd047ea37a3fb8d9e94294ae4bea46c9750e50fe1689ba34e522aa77e22a873d3369e89e7e5672ced6337ae0efbfb8a31ac3bba48b522798b2b86b033adac2e253fc2f048d7c26b9bc7c3c306451a90650305504ba3bd869c9d382027ba381ea3081e730120603551d130101ff040830060101ff020101301f0603551d23041830168014add2c2173808b510358d217b3b86fb8f1ad6b173301d0603551d0e04160414f5273e07c37b153782a854f34bf8941eb280ef6e300e0603551d0f0101ff0404030201863081800603551d1f047930773075a073a071866f687474703a2f2f63726c2d75732d656173742d312d6177732d6e6974726f2d656e636c617665732e73332e75732d656173742d312e616d617a6f6e6177732e636f6d2f63726c2f66326463623035372d333434352d343963642d626131382d3733396663666466353261632e63726c300a06082a8648ce3d0403030368003065023100a446d4c6ebe8dc4ac3196b5a7488d470128a69c843db43ce55e139cd95a1f977074066d9f23e45530b6850217b57cdf402305f358040394462762ca1094b9302a4e1e51cf61dde52a048d1de90d25a239574e0f615659945b64264b997bb5a0ccb335902c2308202be30820245a003020102021500d2582b5520ba5712e796e4f758e577ee985f5954300a06082a8648ce3d040303308189313c303a06035504030c33613833653764313231306434313335632e7a6f6e616c2e75732d656173742d312e6177732e6e6974726f2d656e636c61766573310c300a060355040b0c03415753310f300d060355040a0c06416d617a6f6e310b3009060355040613025553310b300906035504080c0257413110300e06035504070c0753656174746c65301e170d3235303431353031343333385a170d3235303431363031343333385a30818e310b30090603550406130255533113301106035504080c0a57617368696e67746f6e3110300e06035504070c0753656174746c65310f300d060355040a0c06416d617a6f6e310c300a060355040b0c034157533139303706035504030c30692d30366534623938633635343966663830332e75732d656173742d312e6177732e6e6974726f2d656e636c617665733076301006072a8648ce3d020106052b81040022036200049f84fd231f0332361556d06121290b042aba0fc8119cf62b530a34fde2ba0a5213eaf4bcd79cd240492f51702315beebedc7c29d42a72912e0add5975ff35fe8ac7b9167ad19b2984114aa5c6bc466a20d63e5f2bb5d7dc4a9e7a6400545d95fa366306430120603551d130101ff040830060101ff020100300e0603551d0f0101ff040403020204301d0603551d0e0416041431b3f2a9c91d2fbfe1230f702391caeec8567e0d301f0603551d23041830168014f5273e07c37b153782a854f34bf8941eb280ef6e300a06082a8648ce3d040303036700306402300299d6641d327fd9b5986cbfccf00ea02d95eeb7ee6f4193fd4ba28a17a329f67ba20e551ceb3b1c739df61308799d3102302ab166a5394bb64e6e6149da899acde27417ba137083bc4b6f156cde3deea56cde0bf57186c80bd6dafdeb898aeb71566a7075626c69635f6b65795820e8e62201dbe293b703c759f653107acbc2c911fa1d2e66f2c747bec95971a2af69757365725f64617461f6656e6f6e6365f65860b8397a987eb8327f75b4ab764c74dd068cbc107faa518b5d97bc074cf4ea1e8cb5cbaa0446b54d42ac55ad9c84094cedcddaa3b74b4a3b8f681a00cf311232dd663f8e3c9c67b7926e7b9dbdf697e1358e3b380a8e76d088db535d607d96b8a1";
    let document = nitro_attestation::load_nitro_attestation(payload, &clock);
    config.register_enclave(document, scenario.ctx());

    scenario.next_tx(@0x4668aa5963dacfe3e169be3cf824395ab9de3f0a544fc2ca638858a536b5ff4b);

    let enclave = scenario.take_shared<Enclave<SENTINEL>>();
    let mut registry = scenario.take_shared<AgentRegistry>();

    let sig =
        x"b5b70ffde62eb6facf2ab01f03fa0124e9bf646b094e8699c64b964b8dccad42f4a9dc3beccee25b5e7ab5ed3f53cef5d30300af06539f7ed51c842dd3c35603";
    let agent = register_agent(
        &mut registry,
        b"135f5b67-a17c-4bb0-bbfd-f02510971d48".to_string(),
        1747898372482,
        1000, // cost_per_message
        b"You are a helpful AI assistant".to_string(), // system_prompt
        &sig,
        &enclave,
        scenario.ctx(),
    );

    // Test the new functionality
    let agent_ids = get_all_agent_ids(&registry);
    assert!(vector::length(&agent_ids) == 1, 0);
    assert!(agent_exists(&registry, b"135f5b67-a17c-4bb0-bbfd-f02510971d48".to_string()), 1);
    
    let (agent_id, creator, cost, prompt) = get_agent_details(&agent);
    assert!(cost == 1000, 2);
    assert!(prompt == b"You are a helpful AI assistant".to_string(), 3);

    // Transfer the agent to the caller
    transfer::public_transfer(agent, scenario.ctx().sender());

    test_scenario::return_shared(config);
    test_scenario::return_shared(registry);
    clock.destroy_for_testing();
    enclave.destroy();
    destroy(cap);
    scenario.end();
}
