export const DEFAULT_RPC_URL = 'https://api.cartridge.gg/x/starknet/sepolia'
// export const RPC_NODE_URL = process.env.NEXT_PUBLIC_RPC_NODE_URL || DEFAULT_RPC_URL
export const RPC_NODE_URL = DEFAULT_RPC_URL
export const AGENT_REGISTRY_ADDRESS =
  '0x6eea1a6fd3fbf870a043f311ad260c0dc6f384f3c869dd4ccfa550c2202bc485'

export const INDEXER_BASE_URL = process.env.NEXT_PUBLIC_INDEXER_BASE_URL || 'http://localhost:4000'

export const SYSTEM_PROMPT_MAX_TOKENS = 800

export const TEXT_COPIES = {
  leaderboard: {
    heading: 'Leaderboard',
    subheading:
      "Discover agents created over time, active agents and check how both hackers who cracked systems and agent's creators have earned SUI rewards",
  },
  attack: {
    heading: 'Choose your opponent',
    subheading: 'Trick one of these agents into sending you all their SUI',
  },
}

export const SUI_FAUCET_URL = 'https://faucet.sui.io/'

export const TREASURY_ADDRESS = '0xe4e8af19c2943fc2e3cbefa2fca9149985fc3b3c3d9dd312902b2c26dc600d95'
export const LOCAL_API_PATH = 'http://3.92.163.15:3000'

export const SUI_CONFIG = {
  EXAMPLES_PACKAGE_ID: '0xe66533e7317be1f38ba0bdde5b58d000f6330cc06d31c4bbf3f22709eac13001',
  MODULE_NAME: 'sentinel',
  OTW_NAME: 'SENTINEL',
  AGENT_REGISTRY: '0x6eea1a6fd3fbf870a043f311ad260c0dc6f384f3c869dd4ccfa550c2202bc485',
  ENCLAVE_OBJECT_ID: '0xb1eda22ce9f778835f1c14f513a3b849aad3a1f76074839de5cf4b2121f2804e',
  AGENT_OBJECT_IDS: [''],
}

export const EXPLORER_BASE_URL = 'https://testnet.suivision.xyz'
export const MIST_PER_SUI = 1_000_000_000
export const SUI_TESTNET_BASE_URL = 'https://testnet.suivision.xyz/txblock/'
export const PROJECT_GITHUB_URL = 'https://github.com/satyambnsal/sui-sentinal'
export const NAUTILUS_URL = 'https://github.com/MystenLabs/nautilus'
export const YOUTUBE_VIDEO_URL = 'https://www.youtube.com/watch?v=U3qMdgSGASI'
