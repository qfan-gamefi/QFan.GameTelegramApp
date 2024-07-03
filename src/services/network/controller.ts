/**
 * Controller
 *
 * The network controller is responsible for listening to chain updates, updating balances, and tracking
 * transaction statuses.
 */

import { Address, getShardFromAddress, type StoredWallet } from "@/storage/wallet"
import { TokenNetworkData, getTokens } from "@/storage/token"
import { getActiveNetwork } from "@/storage/network"
import { quais } from "quais"
import type { Network } from "./chains"

/**
 * Address object that contains the BIP-39 index that it was derived at
 */
export class AddressWithData {
  balance: number
  chainID: number
  nonce?: number
}

// TokenNetworkAddressData is a TokenNetworkData object that contains the addresses that hold the token
export class TokenNetworkAddressData extends TokenNetworkData {
  totalBalance: number
  addresses: AddressWithData[]
}

export class ProviderWithData extends quais.providers.JsonRpcProvider {
  chainID: number
  shard: string
}

export class RPCActivityResult {
  message: string
  result: RPCTransactionResult[]
  status: string
}

export class RPCTransactionResult {
  status: string
  shard: string
  lookupAddress: string
  blockHash: string
  blockNumber: string
  confirmations: string
  contractAddress: string
  cumulativeGasUsed: string
  from: string
  gasUsed: string
  hash: string
  input: string
  isError: string
  nonce: string
  timeStamp: string
  to: string
  transactionIndex: string
  txreceipt_status: string
  value: string
  type: string
  tokenName?: string
  tokenSymbol?: string
  tokenDecimal?: string
}

export default class NetworkController {
  public activeNetwork: Network
  public tokens: TokenNetworkData[]
  public providers: ProviderWithData[]
  public activity: any[]

  /**
   * @param {Object} opts - Options for initializing the controller
   */
  constructor(opts: any) {
    this.activeNetwork = opts.activeNetwork
    this.tokens = []
    this.providers = []
    this.activity = []
  }

  // This function updates the network controller with the latest addresses and providers
  async updateNetworkController(wallet: StoredWallet) {
    const derivationPath = wallet.derivations.find(
      (derivation) =>
        derivation.chainCode === Number(this.activeNetwork.chainCode)
    )
    if (
      derivationPath == undefined ||
      derivationPath?.addresses?.length === 0
    ) {
      return
    }
    try {
      await this.updateController()
    } catch (e) {
      console.log(e)
    }
  }

  // This function updates the provider lists. It will add new providers if a new address is added.
  // After creating the providers the function will update the balances and fetch the activity upon
  // new block events.
  async updateController() {
    this.activeNetwork = (await getActiveNetwork()) as Network
    this.providers = []
    this.activeNetwork.chains.forEach((chain) => {
      if (!this.providers.find((provider) => provider.shard === chain.shard)) {
        try {
          const provider = new ProviderWithData(chain.rpc)
          provider.shard = chain.shard
          this.providers.push(provider)
        } catch (e) {
          console.log(e)
        }
      }
    })
    const allTokens = await getTokens()
    this.tokens = allTokens.filter(
      (token) =>
        token.network === this.activeNetwork.name || token.type === "native"
    )
  }

  // This function returns the provider for a given address
  getProviderForAddress(address: string) {
    const provider = this.providers.find(
      (provider) => provider.shard === getShardFromAddress(address)[0].shard
    )
    return provider
  }

  // This function fetches the balance for a single address
  async getBalance(address: string) {
    const provider = this.providers.find(
      (provider) => provider.shard === getShardFromAddress(address)[0].shard
    )
    if (provider) {
      try {
        const res = await provider.getBalance(address)
        return quais.utils.formatEther(res)
      } catch (e) {
        console.log(e)
      }
    }
  }

  async getBalanceNumber(address: string) {
    const provider = this.providers.find(
      (provider) => provider.shard === getShardFromAddress(address)[0].shard
    )
    if (provider) {
      try {
        const res = await provider.getBalance(address)
        return res
      } catch (e) {
        console.log(e)
      }
    }
  }

  async nativeAddressData(address: Address) {
    const shard = getShardFromAddress(address.address)[0].shard
    const provider = this.getProviderForAddress(address.address)
    let balance = "0"
    let nonce = 0
    if (provider) {
      try {
        const res = await provider.getBalance(address.address)
        balance = quais.utils.formatEther(res)
        nonce = await provider.getTransactionCount(address.address)
      } catch (e) {
        console.log(e)
      }
    }

    return {
      ...address,
      balance: Number(balance),
      shard: shard,
      chainID: this.activeNetwork.chainID,
      nonce: nonce
    }
  }

  async tokenAddressData(address: Address, token: TokenNetworkData) {
    const tokenShardData = token?.shardData?.find((shardData) => {
      return shardData.shard === getShardFromAddress(address.address)[0].shard
    })

    if (tokenShardData?.address === undefined) {
      return {
        ...address,
        balance: 0,
        shard: getShardFromAddress(address.address)[0].shard,
        chainID: this.activeNetwork.chainID
      }
    }

    const shard = getShardFromAddress(address.address)[0].shard

    const chainData = this.activeNetwork.chains.find((chain) => {
      return chain.shard === shard
    })

    const explorerEndpoint = chainData?.blockExplorerUrl

    let tokenData
    try {
      const url = `${explorerEndpoint}/api?module=account&action=tokenbalance&contractaddress=${tokenShardData.address}&address=${address.address}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      tokenData = await response.json() // read the response as JSON
    } catch (e) {
      console.log(e)
    }
    let balance = 0
    // Return if the request was successful
    if (tokenData.status === "1") {
      balance = Number(tokenData.result)
    }

    return {
      ...address,
      balance: balance,
      shard: shard,
      chainID: this.activeNetwork.chainID
    }
  }

  // This function fetches the balances for all addresses in the wallet
  async getAddressData(addresses: Address[]): Promise<AddressWithData[]> {
    await this.updateController()
    const addressDataPromises = addresses.map(async (address) => {
      try {
        const nativeAddressData = await this.nativeAddressData(address)
        return nativeAddressData
      } catch (e) {
        console.log(e)
      }
    })

    const addressData = await Promise.all(addressDataPromises)
    return addressData as AddressWithData[]
  }

  // This function fetches the activity for all addresses in the wallet
  async fetchActivity(addresses: Address[]) {
    const activityDataPromises = addresses.map(async (address) => {
      try {
        const shard = getShardFromAddress(address.address)[0].shard
        const chainData = this.activeNetwork.chains.find((chain) => {
          return chain.shard === shard
        })

        const explorerEndpoint = chainData?.blockExplorerUrl
        if (explorerEndpoint) {
          let accountActivity: any[] = []

          try {
            const pendingData = await fetch(
              `${explorerEndpoint}/api?module=account&action=pendingtxlist&address=${address.address}`
            )

            const pendingDataJSON = await pendingData.json()
            // Return if the request was successful
            if (pendingDataJSON.status === "1") {
              // add shard and address to each result
              pendingDataJSON.result.forEach((item: any) => {
                item.shard = shard
                item.lookupAddress = address.address
                item.status = "pending"
              })

              accountActivity = accountActivity.concat(pendingDataJSON.result)
            }
          } catch (e) {
            console.log(e)
          }

          try {
            const tokenTxData = await fetch(
              `${explorerEndpoint}/api?module=account&action=tokentx&address=${address.address}`
            )
            if (tokenTxData.ok) {
              const tokenTxDataJSON = await tokenTxData.json()
              // Return if the request was successful
              if (tokenTxDataJSON.status === "1") {
                // add shard and address to each result
                tokenTxDataJSON.result.forEach((item: any) => {
                  item.shard = shard
                  item.lookupAddress = address.address
                  item.status = "confirmed"
                })

                accountActivity = accountActivity.concat(tokenTxDataJSON.result)
              }
            }
          } catch (e) {
            console.log(e)
          }

          try {
            const confirmedData = await fetch(
              `${explorerEndpoint}/api?module=account&action=txlist&address=${address.address}`
            )

            const confirmedDataJSON = await confirmedData.json()
            // Return if the request was successful
            if (confirmedDataJSON.status === "1") {
              // add shard and address to each result
              confirmedDataJSON.result.forEach((item: any) => {
                item.shard = shard
                item.lookupAddress = address.address
                item.status = "confirmed"
              })

              accountActivity = accountActivity.concat(confirmedDataJSON.result)
            }
          } catch (e) {
            console.log(e)
          }

          return accountActivity
        }
      } catch (e) {
        console.log(e)
      }
    })

    const activityData = await Promise.all(activityDataPromises)
    // Remove undefined values
    const filteredActivityData = activityData.filter((item) => item !== undefined)

    let activity: any[] = []
    filteredActivityData.forEach((item) => {
      activity = activity.concat(item)
    })

    // sort pending first and by timestamp second
    activity.sort((a, b) => {
      if (a.status === "pending" && b.status === "confirmed") {
        return -1
      } else if (a.status === "confirmed" && b.status === "pending") {
        return 1
      } else {
        return Number(b.timeStamp) - Number(a.timeStamp)
      }
    })

    // set the type of each activity item
    // remove duplicate hashes and set the duplicates to transfer
    const uniqueActivity: any[] = []
    const hashes: any[] = []
    activity.forEach((item) => {
      if (!hashes.includes(item.hash)) {
        uniqueActivity.push(item)
        hashes.push(item.hash)
        const send: any =
          item.lookupAddress.trim().toLowerCase() ===
          item.from.trim().toLowerCase()
        if (send) {
          item.type = "send"
        } else {
          item.type = "receive"
        }
      } else {
        const index = uniqueActivity.findIndex((i) => i.hash === item.hash)
        if (index !== -1 && uniqueActivity[index].tokenSymbol === undefined) {
          uniqueActivity[index].type = "transfer"
        }
      }
    })

    return uniqueActivity
  }

  async getBalanceData(
    addresses: Address[]
  ): Promise<TokenNetworkAddressData[]> {
    await this.updateController()
    const tokenBalancesPromises = this.tokens.map(async (token) => {
      const addressDataPromises = addresses.map(async (address) => {
        try {
          if (token.type === "native") {
            const nativeAddressData = await this.nativeAddressData(address)
            return nativeAddressData
          }
          if (token.type === "custom") {
            const tokenAddressData = await this.tokenAddressData(address, token)
            return tokenAddressData
          }
        } catch (e) {
          console.log(e)
        }
      })
      const addressData = await Promise.all(addressDataPromises)

      let totalBalance = 0
      addressData.forEach((address) => {
        if (address !== undefined) {
          totalBalance += address.balance
        }
      })

      return {
        ...token,
        addresses: addressData,
        totalBalance: totalBalance
      }
    })
    const tokenBalances = await Promise.all(tokenBalancesPromises)
    return tokenBalances as TokenNetworkAddressData[]
  }
}
