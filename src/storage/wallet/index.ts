import { watch } from "fs"
import { get } from "http"
import { Wallet, quais } from "quais"



import { WALLET_GENERATED } from "./constants"
import { secureStorage, storage } from "../storage"
import { getActiveNetwork } from "../network"
import { decryptHDKey, deriveAddress, encryptHDKey, encryptMnemonic, getWalletFromMnemonic } from "@/crypto"
import { Network, QUAI_CONTEXTS, QuaiContext, getExplorerURLForShard } from "@/services/network/chains"
import { JsonRpcProvider } from "quais"

/**
 * Address object that contains the BIP-39 index that it was derived at
 */
export class Address {
  name: string
  index: number
  path: string
  address: string
  shard: string
}

/**
 * Object that contains a BIP-39 path and addresses at index
 */
export class PathAddresses {
  path: string
  addresses: Address[]
  chainCode: number
}

/**
 * Keyfile stored in secure storage
 */
export interface Keyfile {
  pubkey: string
  keyfile: string
  mnemonic: string
  type: string
}

/**
 * StoredWallet stored in the localstorage
 */
export interface StoredWallet {
  pubkey: string
  derivations: PathAddresses[]
  type: string
}

/**
 * Get the active address
 */
export async function getActiveAddress(): Promise<Address | null> {
  const activeAddress = (await storage.get("active_address")) as Address
  if (!activeAddress) {
    return null
  }
  return activeAddress
}

/**
 *  Set the active address
 */
export async function setActiveAddress(newActiveAddress?: Address) {
  const addresses = await getAddresses()
  if (addresses.length > 0) {
    const address = addresses.find(
      (address) => address.address === newActiveAddress?.address
    )
    await storage.set("active_address", address)
    console.log("Set active address", address)
  }
  else {
    await storage.set("active_address", newActiveAddress)
    console.log("Set active address", newActiveAddress)
  }
}

/**
 * Update address name
 */
export async function updateAddressName(address: Address, name: string) {
  const wallet = await getActiveWallet();
  const activeNetwork = await getActiveNetwork()

  const activeDerivations = wallet?.derivations?.find(
    (item) => item.chainCode === Number(activeNetwork?.chainCode)
  )
  if (activeDerivations === undefined) {
    return
  }

  // Check if address is in active wallet
  const activeAddress = activeDerivations?.addresses?.find(
    (item) => item.address === address.address
  )
  if (activeAddress === undefined) {
    return
  }

  // Get new derivations on wallet and update the derivations in place
  const newDerivations = wallet?.derivations.map((item) => {
    if (item.path !== activeDerivations.path) {
      return item
    }

    const newAddresses = item.addresses.map((item) => {
      if (item.address !== address.address) {
        return item
      }
      return {
        ...item,
        name: name
      }
    })

    return {
      ...item,
      addresses: newAddresses
    }
  })

  const wallets = await getWallets()

  // Update wallets in place
  const newWallets = wallets.map((item) => {
    if (item.pubkey !== wallet?.pubkey) {
      return item
    }

    return {
      ...item,
      derivations: newDerivations
    }
  })

  const newAddress = {
    ...address,
    name: name
  }

  await storage.set("wallets", newWallets)
  await setActiveWallet(wallet as StoredWallet)
  await setActiveAddress(newAddress)
}

/**
 * Set active address by shard
 */
export async function setActiveAddressByShard(shard?: string) {
  const addresses = await getAddresses()
  const address = addresses.find((address) => address.shard === shard)
  if (!address) {
    return
  }
  await storage.set("active_address", address)
}

/**
 * Get the active wallet
 */
export async function getActiveWallet(): Promise<StoredWallet | null> {
  const activeWallet = (await storage.get("active_wallet")) as StoredWallet
  if (!activeWallet) {
    return null
  }
  return activeWallet
}

/**
 * Update active address
 *
 * @param address Updated active address
 */
export async function setActiveWallet(newActiveWallet?: StoredWallet) {
  const wallets = await getWallets()
  const wallet = wallets.find(
    (wallet) => wallet.pubkey === newActiveWallet?.pubkey
  )
  if (!wallet) {
    return
  }

  // save new active address
  await storage.set("active_wallet", wallet)
}

/**
 * Get wallets from storage
 *
 * @returns Wallets in storage
 */
export async function getWallets() {
  const wallets: StoredWallet[] = await storage.get("wallets") || []
  return wallets || []
}

/**
 * Get keyfiles from secure storage
 * @param password
 * @returns
 */
export async function getKeyfiles(password?: string) {
  if (!password) {
    password = (await storage.get("decryption_key")) as string
    if (!password) {
      return []
    }
  }

  await secureStorage.setPassword(password)
  console.log("keyfiles---", secureStorage.getItem("keyfiles"));
  console.log("keyfiles", await secureStorage.get<Keyfile[]>("keyfiles"));

  const keyfiles: Keyfile[] = JSON.parse(secureStorage.getItem("keyfiles") || "[]") as Keyfile[]
  return keyfiles || []
}

/**
 * Get keyfile for wallet
 * @param pubkey
 */
function getKeyfileForWallet(pubkey: string) {
  return getKeyfiles().then((keyfiles) =>
    keyfiles.find((keyfile) => keyfile.pubkey === pubkey)
  )
}

/**
 * Get keyfile for wallet
 * @param pubkey
 * @param password
 */
export function attemptGetKeyfileForWallet(pubkey: string, password: string) {
  return getKeyfiles(password).then((keyfiles) =>
    keyfiles.find((keyfile) => keyfile.pubkey === pubkey)
  )
}

/*
 * Exported attempt function for use in background
 */
export async function attemptGetPrivateKeyForAddress(
  address: string,
  password: string
) {
  if (!password) {
    password = await storage.get("decryption_key") || ""
    if (!password) {
      return []
    }
  }

  // Attempt set secure storage password
  await secureStorage.setPassword(password)

  return await getPrivateKeyForAddress(address)
}

/**
 * Get private key for address
 * @param address
 * @returns
 */
async function getPrivateKeyForAddress(address: string) {
  const signingWallet = await getSigningWallet(address)
  return signingWallet.privateKey
}

/**
 * Create a new wallet
 * @param password
 * @param mnemonic
 * @returns hdWallet
 */
export async function createWallet(password: string, mnemonic: string) {
  // check password
  await secureStorage.setPassword(password)
  await secureStorage.set("keyfiles", [])
  await storage.set("wallets", [])

  const hdWallet = await getWalletFromMnemonic(mnemonic)
  await addWallet(hdWallet, mnemonic, password)

  await storage.set("decryption_key", password)
  await storage.set("signed_in", true)

  return hdWallet
}

/**
 * Add a wallet for the user
 *
 * @param wallet Wallet JWK object
 * @param password Password to encrypt with
 */
export async function addWallet(wallet: any, mnemonic: any, password: string) {
  const wallets = await getWallets()
  const keyfiles = await getKeyfiles()
  const freshInstall = wallets.length === 0

  const encryptedHDKey = await encryptHDKey(password, wallet)
  const encryptedMnemonic = await encryptMnemonic(password, mnemonic)

  // Get address at default hdPath and 0 index
  const hdPath = "m/44'/994'/0'/0"

  const accountNode = wallet.derive(hdPath)

  // Push wallet
  wallets.push({
    pubkey: accountNode.publicKey.toString("hex"),
    derivations: [],
    type: WALLET_GENERATED
  })

  keyfiles.push({
    pubkey: accountNode.publicKey.toString("hex"),
    keyfile: encryptedHDKey,
    mnemonic: encryptedMnemonic,
    type: WALLET_GENERATED
  })

  // Save data
  await secureStorage.setPassword(password)
  await secureStorage.set("keyfiles", keyfiles)
  await storage.set("wallets", wallets)

  // Set active wallet
  await storage.set("active_wallet", wallets[0])
}

export async function addAdddressByShard(shard: string, name?: string) {
  const wallet = await getActiveWallet()
  if (!wallet) {
    return
  }
  const activeNetwork = await getActiveNetwork()

  const path = "m/44'/" + activeNetwork?.chainCode + "'/0'/0"

  // Decrypt and derive address
  const password = await storage.get<string>("decryption_key") || ""
  const keyfile = await getKeyfileForWallet(wallet.pubkey)
  if (!keyfile) {
    return
  }
  const hdKey = await decryptHDKey(password, keyfile.keyfile)
  const newAddress = grindAddress(hdKey, path, 0, shard)

  // Add address to derivation in place
  const newDerivations = wallet.derivations.map((item) => {
    if (item.path !== path) {
      return item
    }

    let contains = false
    if (
      item.addresses.find((address) => address.address === newAddress.address)
    ) {
      contains = true
    }

    if (!name) {
      // Update name in place
      newAddress.name = "Address " + (item.addresses.length + 1).toString()
    } else {
      newAddress.name = name
    }

    if (!contains) {
      item.addresses.push(newAddress)
    }

    return {
      ...item,
      addresses: item.addresses
    }
  })

  // Otherwise, we have a new path to add to
  if (newDerivations.length === 0) {
    newAddress.name = "Address 1"
    newDerivations.push({
      path: path,
      addresses: [newAddress],
      chainCode: activeNetwork?.chainCode || 0
    })
  }

  const wallets = await getWallets()
  // Update wallet in place
  const newWallets = wallets.map((item) => {
    if (item.pubkey !== wallet.pubkey) {
      return item
    }

    return {
      ...item,
      derivations: newDerivations
    }
  })

  // save updated wallets
  await storage.set("wallets", newWallets)

  const activeWallet = await getActiveWallet()
  if (activeWallet?.pubkey === wallet.pubkey) {
    wallet.derivations = newDerivations
    await setActiveWallet(wallet)
  }

  // Update active address
  await setActiveAddress(newAddress)
}

/**
 * Grind an address for a given hdkey, path, index, and shard
 * @param hdKey
 * @param path
 * @param index
 * @param shard
 * @returns
 */
function grindAddress(hdKey: any, path: string, index: number, shard: any): Address {
  let found = false
  let newAddress = ""
  while (!found) {
    newAddress = deriveAddress(hdKey, { hdPath: path, index: index })
    const addrShard = getShardFromAddress(newAddress)

    // Check if address is in a shard
    if (addrShard[0] !== undefined) {
      // Check if address is in correct shard
      if (addrShard[0].shard === shard) {
        found = true
        break
      }
    }
    index++
  }
  return {
    name: "Address " + index.toString(),
    shard: shard,
    address: newAddress,
    index: index,
    path: path + "/" + index.toString()
  }
}

export function getShardFromAddress(address: string) {
  return QUAI_CONTEXTS.filter((obj) => {
    const num = Number(address.substring(0, 4))
    const start = Number("0x" + obj.byte[0])
    const end = Number("0x" + obj.byte[1])
    return num >= start && num <= end
  })
}

export class QuaiContextAddresses extends QuaiContext {
  addresses: Address[]
}

export function groupByPrefix(addresses: Address[]) {
  const groups = QUAI_CONTEXTS as QuaiContextAddresses[]
  groups.forEach((obj) => (obj.addresses = []))
  for (let i = 0; i < addresses.length; i++) {
    const shard = getShardFromAddress(addresses[i].address)
    if (shard[0] !== undefined) {
      groups.find((obj: QuaiContextAddresses) => obj.name === shard[0].name)?.addresses.push(addresses[i])
    }
  }
  return groups
}

export interface TransactionRequest {
  to?: string
  from: string
  value?: string
  externalGasLimit?: number
  externalGasPrice?: number
  externalGasTip?: number
  gasLimit?: number
  maxFeePerGas?: number
  maxPriorityFeePerGas?: number
  data?: string
  nonce?: number
  type?: number
}

async function getSigningWallet(from: string) {
  const wallet = await getActiveWallet()
  if (!wallet) {
    throw new Error("No active wallet")
  }
  const activeNetwork = await getActiveNetwork()
  const activeDerivations = wallet?.derivations?.find(
    (item) => item.chainCode === Number(activeNetwork?.chainCode)
  )
  const activeAddress = activeDerivations?.addresses?.find(
    (item) => item.address === from
  )
  const password = await storage.get<string>("decryption_key") || ""
  const keyfile = await getKeyfileForWallet(wallet?.pubkey)

  const hdKey = await decryptHDKey(password, keyfile?.keyfile)

  if (!activeAddress) {
    throw new Error("Address not found")
  }
  const addressNode = hdKey.derive(activeAddress?.path)
  const privKey = addressNode.privateKey
  //convert privKey Uint8Array to string
  if (!privKey) {
    throw new Error("Private key not found")
  }
  const privKeyString = Buffer.from(privKey).toString('hex');


  const fromShard = getShardFromAddress(from)
  const fromChain = activeNetwork?.chains.find(
    (item: any) => item.shard === fromShard[0].shard
  )

  const provider = new JsonRpcProvider(fromChain?.rpc)
  const signingWallet = new quais.Wallet(privKeyString, provider)
  return signingWallet
}

/**
 * Signed and send a transaction
 * @param transaction
 * @returns
 */
export async function signAndSendTransaction(transaction: TransactionRequest) {
  const wallet = await getActiveWallet()
  if (!wallet) {
    throw new Error("No active wallet")
  }
  const activeNetwork = await getActiveNetwork()
  const activeDerivations = wallet?.derivations?.find(
    (item) => item.chainCode === Number(activeNetwork?.chainCode)
  )
  const activeAddress = activeDerivations?.addresses?.find(
    (item) => item.address === transaction.from
  )

  if (activeAddress === undefined) {
    throw new Error("Address not found")
  }

  const password = await storage.get<string>("decryption_key")
  if (!password) {
    throw new Error("No password found")
  }
  const keyfile = await getKeyfileForWallet(wallet.pubkey)

  const hdKey = await decryptHDKey(password, keyfile?.keyfile)

  const addressNode = hdKey.derive(activeAddress.path)
  const privKey = addressNode.privateKey
  //convert to string
  if (!privKey) {
    throw new Error("Private key not found")
  }
  const privKeyString = Buffer.from(privKey).toString('hex');

  const fromShard = getShardFromAddress(transaction.from)
  const fromChain = activeNetwork?.chains.find(
    (item: any) => item.shard === fromShard[0].shard
  )

  const toShard = getShardFromAddress(transaction.from)

  const provider = new quais.JsonRpcProvider(fromChain?.rpc)
  const signingWallet = new quais.Wallet(privKeyString, provider)

  if (fromShard[0].shard !== toShard[0].shard) {
    transaction.type = 2
  }

  const feeData = await provider.getFeeData()

  if (transaction.maxFeePerGas == undefined) {
    transaction.maxFeePerGas = 1
  }
  if (transaction.maxPriorityFeePerGas == undefined) {
    transaction.maxPriorityFeePerGas = 1
  }

  if (transaction.gasLimit === undefined) {
    transaction.gasLimit = 21000
  }

  const rawTransaction = {
    to: transaction.to,
    value: BigInt(Number(transaction.value)),
    nonce: transaction.nonce,
    // gasLimit: BigInt(Number(transaction.gasLimit)),
    maxFeePerGas: BigInt(transaction.maxFeePerGas),
    maxPriorityFeePerGas: BigInt(transaction.maxPriorityFeePerGas),
    gasLimit: BigInt(transaction.gasLimit),
    type: 0,
    externalGasLimit: BigInt(0),
    externalGasPrice: BigInt(0),
    externalGasTip: BigInt(0)
  }

  if (fromShard[0].shard != toShard[0].shard) {
    rawTransaction.gasLimit = BigInt(420000)
    rawTransaction.externalGasLimit = BigInt(100000)
    rawTransaction.externalGasPrice = BigInt(Number(feeData.maxFeePerGas) * 2)
    rawTransaction.externalGasTip = BigInt(
      Number(feeData.maxPriorityFeePerGas) * 2
    )
    rawTransaction.type = 2
  }

  const tx = await signingWallet.sendTransaction(rawTransaction)
  return tx
}

/**
 * Send a token transfer event to the blockchain
 * @param transaction
 * @returns
 */
export async function sendTokenTransfer(transaction: any) {
  const signingWallet = await getSigningWallet(transaction.from)

  if (transaction.abi === undefined) {
    transaction.abi = [
      // transfer
      "function transfer(address recipient, uint256 amount) public returns (bool)"
    ]
  }
  const myContract = new quais.Contract(
    transaction.contractAddress,
    transaction.abi,
    signingWallet
  )

  // If your contract requires constructor args, you can specify them here
  const tx = await myContract.transfer(transaction.to, transaction.value, {
    gasLimit: 1000000
  })

  return tx
}

export async function getAddresses() {
  const wallet = await getActiveWallet()
  const activeNetwork = await getActiveNetwork()

  const activeDerivations = wallet?.derivations?.find(
    (item) => item.chainCode === Number(activeNetwork?.chainCode)
  )
  if (activeDerivations === undefined) {
    return []
  }
  return activeDerivations.addresses
}

export async function getAddress(address: string) {
  const wallet = await getActiveWallet()
  const activeNetwork = await getActiveNetwork()
  const activeDerivations = wallet?.derivations?.find(
    (item) => item.chainCode === Number(activeNetwork?.chainCode)
  )
  const requestedAddress = activeDerivations?.addresses?.find(
    (item) => item.address === address
  )
  return requestedAddress
}

export async function personalSignFromAddress(address: string, msg: string) {
  const wallet = await getActiveWallet()
  if (!wallet) {
    throw new Error("No active wallet")
  }
  const activeNetwork = await getActiveNetwork()
  const activeDerivations = wallet?.derivations?.find(
    (item) => item.chainCode === Number(activeNetwork?.chainCode)
  )
  const activeAddress = activeDerivations?.addresses?.find(
    (item) => item.address === address
  )
  if (activeAddress === undefined) {
    throw new Error("Address not found")
  }

  const password = await storage.get<string>("decryption_key")
  if (!password) {
    throw new Error("No password found")
  }
  const keyfile = await getKeyfileForWallet(wallet.pubkey)

  const hdKey = await decryptHDKey(password, keyfile?.keyfile)

  const addressNode = hdKey.derive(activeAddress.path)
  const privKey = addressNode.privateKey
  //convert to string
  if (!privKey) {
    throw new Error("Private key not found")
  }
  const privKeyString = Buffer.from(privKey).toString('hex');

  const signingWallet = new quais.Wallet(privKeyString)

  const signature = await signingWallet.signMessage(msg)
  return signature
}

// Support Quaiscan by default
export async function getLinkToExplorer(address: Address): Promise<string> {
  const activeNetwork = (await getActiveNetwork()) as Network;
  const shard = getShardFromAddress(address.address)[0].shard
  if (shard == undefined) {
    return ""
  }
  const explorerURL = getExplorerURLForShard(activeNetwork, shard)
  const url = explorerURL + "/address/" + address.address
  return url;
}