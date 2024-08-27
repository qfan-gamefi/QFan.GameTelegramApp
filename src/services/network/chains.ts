// Network class contains data about a default or custom network.
export class Network {
  name: string
  chains: ChainData[]
  isCustom: boolean
  chainCode: number
  chainID: number
}

export class ChainData {
  name: string
  shard: string
  blockExplorerUrl: string
  rpc: string
}

export const NETWORK_LIST = []

export const NETWORK_TO_CHAIN_CODE = {
  Colosseum: 994,
  Garden: 994,
  Local: 994
}

export const CHAIN_ID_TO_NETWORK = {
  9000: "Colosseum",
  12000: "Garden",
  1337: "Local"
}

export const NETWORK_TO_CHAIN_ID = {
  Colosseum: 994,
  Garden: 3,
  Local: 1337
}

export const DEFAULT_QUAI_TESNTET = {
  name: "Colosseum",
  chainCode: 994,
  chainID: 9000,
  isCustom: false,
  chains: [
    {
      name: "Cyprus One",
      shard: "cyprus-1",
      rpc: "http://rpc.sandbox.quai.network:9200",
      blockExplorerUrl: "https://quaiscan.io"
    }
  ]
} as Network



export const DEFAULT_NETWORKS = [
  DEFAULT_QUAI_TESNTET
]

export class QuaiContext {
  name: string
  shard: string
  context: number
  byte: string[]
}

export const QUAI_CONTEXTS = [
  {
    name: "Cyprus One",
    shard: "cyprus-1",
    context: 2,
    byte: ["00", "1D"]
  },
  {
    name: "Cyprus Two",
    shard: "cyprus-2",
    context: 2,
    byte: ["1E", "3A"]
  },
  {
    name: "Cyprus Three",
    shard: "cyprus-3",
    context: 2,
    byte: ["3B", "57"]
  },
  {
    name: "Paxos One",
    shard: "paxos-1",
    context: 2,
    byte: ["58", "73"]
  },
  {
    name: "Paxos Two",
    shard: "paxos-2",
    context: 2,
    byte: ["74", "8F"]
  },
  {
    name: "Paxos Three",
    shard: "paxos-3",
    context: 2,
    byte: ["90", "AB"]
  },
  {
    name: "Hydra One",
    shard: "hydra-1",
    context: 2,
    byte: ["AC", "C7"]
  },
  {
    name: "Hydra Two",
    shard: "hydra-2",
    context: 2,
    byte: ["C8", "E3"]
  },
  {
    name: "Hydra Three",
    shard: "hydra-3",
    context: 2,
    byte: ["E4", "FF"]
  }
]

export function getExplorerURLForShard(network: Network, shard: string) {
  const chainData = network.chains.find(
    (chain) => chain.shard === shard
  ) as ChainData
  if (chainData === undefined) {
    return undefined
  }
  return chainData.blockExplorerUrl
}
