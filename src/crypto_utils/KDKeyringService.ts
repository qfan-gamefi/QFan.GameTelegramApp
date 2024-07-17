import { providers, utils, Wallet } from "quais"
import HDKeyring from "./HDKeyring"
import { isPrivateKey, SignerImportSource, SignerSourceTypes, type InternalSignerWithType, type SerializedKeyringData, type SignerImportMetadata } from "./type"
import { secureStorage, storage } from "@/storage/storage"
import { getEncryptedVaults, KEYRING_KEY, VAULT_KEY, writeLatestEncryptedVault } from "./storage"
import { decryptVault, deriveSymmetricKeyFromPassword, encryptVault, type SaltedKey } from "./encryption"
import { KeyringTypes, type EIP712TypedData, type HexString } from "@/storage/types"
import logger from "./logger"
import { ChainData, DEFAULT_NETWORKS, DEFAULT_NETWORKS_BY_CHAIN_ID, getShardFromAddress, QUAI_NETWORK } from "./constants"
import { normalizeEVMAddress, sameEVMAddress } from "./utils"
import { parseAndValidateSignedTransaction, type SignedTransaction, type TransactionRequestWithNonce } from "./networks"
import { parse as parseRawTransaction } from "@quais/transactions"
import type { TransactionRequest } from "ethers"

export default class KeyringService {
    #cachedKey: SaltedKey | null = null
    #keyrings: HDKeyring[] = []

    #privateKeys: Wallet[] = []

    #keyringMetadata: { [keyringId: string]: { source: SignerImportSource } } = {}

    async unlock(
        password: string,
        ignoreExistingVaults = false
    ): Promise<boolean> {
        if (!ignoreExistingVaults) {
            const { vaults } = await getEncryptedVaults()
            const currentEncryptedVault = vaults.slice(-1)[0]?.vault
            if (currentEncryptedVault) {
                // attempt to load the vault
                const saltedKey = await deriveSymmetricKeyFromPassword(
                    password,
                    currentEncryptedVault.salt
                )
                let plainTextVault: SerializedKeyringData
                try {
                    plainTextVault = await decryptVault<SerializedKeyringData>(
                        currentEncryptedVault,
                        saltedKey
                    )
                    this.#cachedKey = saltedKey
                } catch (err) {
                    // if we weren't able to load the vault, don't unlock
                    logger.error("Failed to decrypt vault", err)
                    return false
                }
                // hooray! vault is loaded, import any serialized keyrings
                this.#keyrings = []
                this.#keyringMetadata = {}
                this.#privateKeys = []
                plainTextVault.keyrings.forEach((kr) => {
                    this.#keyrings.push(HDKeyring.deserialize(kr))
                })

                const fromChain = QUAI_NETWORK.chains?.find(x => x.shard === 'cyprus-1') as ChainData;
                const provider = new providers.JsonRpcProvider(fromChain.rpc)
                plainTextVault.privateKeys?.forEach((pk) =>
                    this.#privateKeys.push(new Wallet(pk.privateKey, provider))
                )

                this.#keyringMetadata = {
                    ...plainTextVault.metadata,
                }
            }
        }

        // if there's no vault or we want to force a new vault, generate a new key
        // and unlock
        if (!this.#cachedKey) {
            this.#cachedKey = await deriveSymmetricKeyFromPassword(password)
            await this.persistKeyrings()
        }
        return true
    }

    getPrivateKeys() {
        return this.#privateKeys
    }

    private async persistKeyrings() {
        // This if guard will always pass due to requireUnlocked, but statically
        // prove it to TypeScript.
        const serializedKeyrings = this.#keyrings.map((kr) => kr.serializeSync())
        const serializedPrivateKeys =
            this.#privateKeys.map((wallet) => ({
                version: 1,
                id: wallet.publicKey,
                privateKey: wallet.privateKey,
            }))

        const keyringMetadata = { ...this.#keyringMetadata }
        serializedKeyrings.sort((a, b) => (a.id > b.id ? 1 : -1))

        const vault = await encryptVault(
            {
                keyrings: serializedKeyrings,
                privateKeys: serializedPrivateKeys,
                metadata: keyringMetadata,
            },
            this.#cachedKey as SaltedKey
        )
        await writeLatestEncryptedVault(vault)
    }

    /**
   * Generate a new keyring
   *
   * @param type - the type of keyring to generate. Currently only supports 256-
   *        bit HD keys.
   * @returns An object containing the string ID of the new keyring and the
   *          mnemonic for the new keyring. Note that the mnemonic can only be
   *          accessed at generation time through this return value.
   */
    async generateNewKeyring(
        type: KeyringTypes,
        path?: string
    ): Promise<{ id: string; mnemonic: string[] }> {
        if (type !== KeyringTypes.mnemonicBIP39S256) {
            throw new Error(
                "KeyringService only supports generating 256-bit HD key trees"
            )
        }

        const options: { strength: number; path?: string } = { strength: 256 }

        if (path) {
            options.path = path
        }

        const newKeyring = new HDKeyring(options)

        const { mnemonic } = newKeyring.serializeSync()

        return { id: newKeyring.id, mnemonic: mnemonic.split(" ") }
    }

    /**
     * Import new internal signer
     *
     * @param signerMetadata any signer with type and metadata
     * @returns null | string - if new account was added or existing account was found then returns an address
     */
    async importKeyring(
        signerMetadata: SignerImportMetadata
    ): Promise<HexString | null> {

        try {
            let address: HexString | null

            if (signerMetadata.type === SignerSourceTypes.privateKey) {
                address = this.#importPrivateKey(signerMetadata.privateKey)
            } else {
                const { mnemonic, source, path } = signerMetadata
                address = this.#importKeyring(mnemonic, source, path)
            }

            if (!address) {
                throw new Error("address is null")
            }

            await this.persistKeyrings()

            return address
        } catch (error) {
            logger.error("Signer import failed:", error)
            return null
        }
    }

    /**
     * Import keyring and pull the first address from that
     * keyring for system use.
     *
     * @param mnemonic - a seed phrase
     * @returns The string ID of the new keyring.
     */
    #importKeyring(
        mnemonic: string,
        source: SignerImportSource,
        path?: string
    ): string {
        const newKeyring = path
            ? new HDKeyring({ mnemonic, path })
            : new HDKeyring({ mnemonic })

        const existingKeyring = this.#keyrings.find((kr) => kr.id === newKeyring.id)
        if (existingKeyring) {
            const [address] = existingKeyring.getAddressesSync()
            return address
        }

        this.#keyrings.push(newKeyring)

        // FIXME temp solution for SDK v5
        // create a new address until we find an address for the target shard
        let address
        let found = false
        const DEFAULT_SHARD = "cyprus-1"
        while (!found) {
            address = newKeyring.addAddressesSync(1)[0]
            const shardFromAddress = getShardFromAddress(address)
            if (
                shardFromAddress !== undefined &&
                shardFromAddress === DEFAULT_SHARD
            ) {
                found = true
                break
            }
        }
        if (address === undefined || address === null || address === "") {
            throw new Error(`Could not find address in given shard ${DEFAULT_SHARD}`)
        }

        this.#keyringMetadata[newKeyring.id] = { source }

        return address
    }

    /**
     * Import private key with a string
     * @param privateKey - string
     * @returns string - address of imported or existing account
     */
    #importPrivateKey(privateKey: string): string {
        const newWallet = new Wallet(privateKey)
        const normalizedAddress = normalizeEVMAddress(newWallet.address)

        if (this.#findSigner(normalizedAddress)) return normalizedAddress

        this.#privateKeys.push(newWallet)
        this.#keyringMetadata[normalizedAddress] = {
            source: SignerImportSource.import,
        }
        return normalizedAddress
    }

    #findSigner(account: HexString): InternalSignerWithType | null {
        const keyring = this.#findKeyringNew(account)
        if (keyring)
            return {
                signer: keyring,
                type: SignerSourceTypes.keyring,
            }

        const privateKey = this.#findPrivateKey(account)
        if (privateKey)
            return {
                signer: privateKey,
                type: SignerSourceTypes.privateKey,
            }

        return null
    }

    /**
   * Find keyring associated with an account.
   *
   * @param account - the account address desired to search the keyring for.
   * @returns HD keyring object
   */
    #findKeyringNew(account: HexString): HDKeyring | null {
        const keyring = this.#keyrings.find((kr) =>
            kr.getAddressesSync().includes(normalizeEVMAddress(account))
        )

        return keyring ?? null
    }

    /**
     * Find keyring associated with an account.
     *
     * @param account - the account desired to search the keyring for.
     */
    async #findKeyring(account: HexString): Promise<HDKeyring> {
        const keyring = this.#keyrings.find((kr) =>
            kr.getAddressesSync().includes(normalizeEVMAddress(account))
        )
        if (!keyring) {
            throw new Error("Address keyring not found.")
        }
        return keyring
    }

    /**
     * Find a wallet imported with a private key
     *
     * @param account - the account address desired to search the wallet for.
     * @returns Ether's Wallet object
     */
    #findPrivateKey(account: HexString): Wallet | null {
        const privateKey = this.#privateKeys.find((item) =>
            sameEVMAddress(item.address, account)
        )

        return privateKey ?? null
    }

    /**
   * Sign a transaction.
   *
   * @param addressOnNetwork - the desired account address on network to sign the transaction
   * @param txRequest -
   */
    async signTransaction(
        address: string,
        txRequest: providers.TransactionRequest
    ) {
        const network = QUAI_NETWORK
        const signerWithType = this.#findSigner(address)
        if (!signerWithType)
            throw new Error(
                `Signing transaction failed. Signer for address ${address} was not found.`
            )

        if (isPrivateKey(signerWithType)) {
            const signedRawTransactionString = await signerWithType.signer.signTransaction(txRequest) // Using HDKeyring for deterministic wallet sign
            const parsedTx = parseRawTransaction(signedRawTransactionString)
            const signedTransaction = parseAndValidateSignedTransaction(
                parsedTx,
                network
            )

            return signedTransaction
        }
    }



    /**
     * Sign typed data based on EIP-712 with the usage of eth_signTypedData_v4 method,
     * more information about the EIP can be found at https://eips.ethereum.org/EIPS/eip-712
     *
     * @param typedData - the data to be signed
     * @param account - signers account address
     */

    async signTypedData({
        typedData,
        account,
    }: {
        typedData: EIP712TypedData
        account: HexString
    }): Promise<string> {
        const { domain, types, message } = typedData
        const { EIP712Domain, ...typesForSigning } = types

        const signerWithType = this.#findSigner(account)
        if (!signerWithType)
            throw new Error(
                `Signing transaction failed. Signer for address ${account} was not found.`
            )

        try {
            const signature = isPrivateKey(signerWithType)
                ? await signerWithType.signer._signTypedData(
                    domain,
                    typesForSigning,
                    message
                )
                : await signerWithType.signer.signTypedData(
                    account,
                    domain,
                    typesForSigning,
                    message
                )

            return signature
        } catch (error) {
            throw new Error("Signing data failed")
        }
    }
}