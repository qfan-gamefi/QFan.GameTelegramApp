import type { SerializedHDWallet } from "node_modules/quais/lib/esm/wallet/hdwallet"
import type HDKeyring from "./HDKeyring"
import type { HexString, KeyringTypes } from "@/storage/types"
import type { QuaiHDWallet, Wallet } from "quais"

export type Keyring = {
  type: KeyringTypes
  id: string | null
  path: string | null
  addresses: string[]
}

export type UNIXTime = number

export type PrivateKey = Keyring & {
  type: KeyringTypes.singleSECP
  path: null
  addresses: string[]
}

export type KeyringAccountSigner = {
  type: "keyring"
  keyringID: string
  shard: string
}
export type PrivateKeyAccountSigner = {
  type: "private-key"
  walletID: string
  shard: string
}

export type SerializedPrivateKey = {
  version: number
  id: string
  privateKey: string
}

export enum SignerSourceTypes {
  privateKey = "privateKey",
  keyring = "keyring",
}

export const isPrivateKey = (
  signer: InternalSignerWithType
): signer is InternalSignerPrivateKey =>
  signer.type === SignerSourceTypes.privateKey

export enum SignerImportSource {
  import = "import",
  internal = "internal",
}

export type ImportMetadataPrivateKey = {
  type: SignerSourceTypes.privateKey
  privateKey: string
}

export type ImportMetadataHDKeyring = {
  type: SignerSourceTypes.keyring
  mnemonic: string
  source: SignerImportSource
  path?: string
}
export type SignerImportMetadata =
  | ImportMetadataPrivateKey
  | ImportMetadataHDKeyring

type InternalSignerHDKeyring = {
  signer: QuaiHDWallet
  address: string
  type: SignerSourceTypes.keyring
}
export type InternalSignerPrivateKey = {
  signer: Wallet
  address: string
  type: SignerSourceTypes.privateKey
}
export type InternalSignerWithType =
  | InternalSignerPrivateKey
  | InternalSignerHDKeyring

export interface SerializedVaultData {
  wallets: SerializedPrivateKey[]
  quaiHDWallets: SerializedHDWallet[]
  metadata: { [keyringId: string]: { source: SignerImportSource } }
}

export type WalletInfo = {
  type: KeyringTypes,
  address: string,
  id: string,
  path: string | null,
}