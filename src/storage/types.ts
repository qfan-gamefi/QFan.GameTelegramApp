import type { TypedDataField } from "@ethersproject/abstract-signer"
import { Opaque } from "./tag-types"

/**
 * Named type for strings that should be domain names.
 *
 * Currently *does not offer type safety*, just documentation value; see
 * https://github.com/microsoft/TypeScript/issues/202 and
 * https://github.com/microsoft/TypeScript/issues/41160 for TS features that
 * would give this some more teeth. Right now, any `string` can be assigned
 * into a variable of type `DomainName` and vice versa.
 */
export type DomainName = string

/**
 * Named type for strings that should be hexadecimal numbers.
 *
 * Currently *does not offer type safety*, just documentation value; see
 * https://github.com/microsoft/TypeScript/issues/202 and
 * https://github.com/microsoft/TypeScript/issues/41160 for TS features that
 * would give this some more teeth. Right now, any `string` can be assigned
 * into a variable of type `HexString` and vice versa.
 */
export type HexString = string

declare const NormalizedEVMAddressSymbol: unique symbol

export type NormalizedEVMAddress = Opaque<
  string,
  typeof NormalizedEVMAddressSymbol
>

/*
 * Named type for a number measuring time in seconds since the Unix Epoch,
 * January 1st, 1970 UTC.
 *
 * Currently *does not offer type safety*, just documentation value; see
 * https://github.com/microsoft/TypeScript/issues/202 and for a TS feature that
 * would give this some more teeth. Right now, any `number` can be assigned
 * into a variable of type `UNIXTime` and vice versa.
 */
export type UNIXTime = number

export enum KeyringTypes {
  mnemonicBIP39S128 = "mnemonic#bip39:128",
  mnemonicBIP39S256 = "mnemonic#bip39:256",
  metamaskMnemonic = "mnemonic#metamask",
  singleSECP = "single#secp256k1",
}

export type EIP191Data = string

export type EIP712DomainType = {
  name?: string
  version?: string
  chainId?: number | string
  verifyingContract?: HexString
}

export type EIP712TypedData<T = Record<string, unknown>> = {
  domain: EIP712DomainType
  types: Record<string, TypedDataField[]>
  message: T
  primaryType: string
}

export type Writeable<T> = { -readonly [P in keyof T]: T[P] }
export type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> }
