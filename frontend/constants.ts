export const DEFAULT_RPC_URL = 'https://api.cartridge.gg/x/starknet/sepolia'
// export const RPC_NODE_URL = process.env.NEXT_PUBLIC_RPC_NODE_URL || DEFAULT_RPC_URL
export const RPC_NODE_URL = DEFAULT_RPC_URL
export const AGENT_REGISTRY_ADDRESS =
  '0x02f6574e5b2e998e58dae9c256c8413d5bd4a9850a5f8162afe824b69cffeee7'

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
export const LOCAL_API_PATH = 'http://54.81.11.64:3000'

export const SUI_CONFIG = {
  EXAMPLES_PACKAGE_ID: '0x057874a5368987ba134f388a9283887f88670f6730af3d01c9a3bb4d8b9bb6ad',
  MODULE_NAME: 'sentinel',
  OTW_NAME: 'SENTINEL',
  AGENT_REGISTRY: '0xebe58dadbc250211695411a09c4118e51cf83a8db1f418961298a87444f6a1fd',
  ENCLAVE_OBJECT_ID: '0x5bc7b3dbe25f61535578e05b9c1979c197cf1962afff8d129de16483b1fd05d1',
  AGENT_OBJECT_IDS: ['0xd6784e19fa6dd18f4a6f3c7c14e405f2208d223a18cc852bfbef6c7b3bf88ff5'],
}

export const EXPLORER_BASE_URL = 'https://testnet.suivision.xyz'
export const MIST_PER_SUI = 1_000_000_000
export const SUI_TESTNET_BASE_URL = 'https://testnet.suivision.xyz/txblock/'
export const PROJECT_GITHUB_URL = 'https://github.com/satyambnsal/sui-sentinal'
export const NAUTILUS_URL = 'https://github.com/MystenLabs/nautilus'
export const YOUTUBE_VIDEO_URL = 'https://www.youtube.com/watch?v=U3qMdgSGASI'
