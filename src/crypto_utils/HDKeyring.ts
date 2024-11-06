import {
    Contract,
    getAddress,
    isQuaiAddress,
    JsonRpcProvider,
    Mnemonic,
    parseUnits,
    QuaiHDWallet,
    randomBytes,
    Shard,
    SigningKey,
    Zone,
    type AddressLike,
} from "quais";
import { Wallet } from "quais";
import { normalizeHexAddress } from "./utils";
import {
    SignerImportSource,
    SignerSourceTypes,
    type InternalSignerPrivateKey,
    type InternalSignerWithType,
    type PrivateKey,
    type SerializedPrivateKey,
    type SerializedVaultData,
    type SignerImportMetadata,
    type WalletInfo,
} from "./type";
import { KeyringTypes } from "@/storage/types";
import { getEncryptedVaults, writeLatestEncryptedVault } from "./storage";
import {
    decryptVault,
    deriveSymmetricKeyFromPassword,
    encryptVault,
    type SaltedKey,
} from "./encryption";
import logger from "./logger";
import type { SerializedHDWallet } from "node_modules/quais/lib/esm/wallet/hdwallet";
import { secureStorage, storage } from "@/storage/storage";
import { activeProvider } from "./networks";
import { ERC20_INTERFACE } from "./erc20";
import { formatEther, parseEther } from "ethers";
import type { TransactionReceipt } from "@ethersproject/providers";
import { CONTRACT_ADDRESS, CONTRACT_OWNER_ADDRESS } from "./constants";
import { QuaiTransactionRequest, QuaiTransactionResponse } from "quais/lib/commonjs/providers";
import { HexString } from "quais/lib/commonjs/utils";

export default class HDKeyring {
    private cachedKey: SaltedKey | null = null;

    private wallets: Wallet[] = [];

    private quaiHDWallets: QuaiHDWallet[] = [];

    private readonly quaiHDWalletAccountIndex: number = 0;

    private readonly platformFee = "0.00005";

    private keyringMetadata: {
        [keyringId: string]: { source: SignerImportSource };
    } = {};

    get isSigning(): boolean {
        return this.wallets && this.wallets.length > 0;
    }

    get password() {
        return secureStorage.getPassword() as string;
    }

    public async unlock(ignoreExistingVaults = false): Promise<boolean> {
        if (!this.locked()) {
            logger.warn("KeyringService is already unlocked!");
            return true;
        }

        if (!ignoreExistingVaults) {
            await this.loadKeyrings();
        }

        // if there's no vault, or we want to force a new vault, generate a new key and unlock
        if (!this.cachedKey) {
            this.cachedKey = await deriveSymmetricKeyFromPassword(
                this.password
            );
            await this.persistKeyrings();
        }

        return true;
    }

    locked() {
        return this.cachedKey === null;
    }

    /**
     * Generate a new hd wallet mnemonic
     *
     * @param type - the type of keyring to generate
     * @returns An object containing the string ID of the new keyring and the
     *          mnemonic for the new keyring. Note that the mnemonic can only be
     *          accessed at generation time through this return value.
     */
    public async generateQuaiHDWalletMnemonic(
        type: KeyringTypes
    ): Promise<{ id: string; mnemonic: string[] }> {
        if (type !== KeyringTypes.mnemonicBIP39S256) {
            throw new Error(
                "KeyringService only supports generating 256-bit HD key trees"
            );
        }

        const randomBytes = this.generateRandomBytes(24);
        const { phrase } = Mnemonic.fromEntropy(randomBytes);

        // used only for redux, so we can use quaiHDWallets length as id
        const keyringIdToVerify = this.quaiHDWallets.length.toString();

        return { id: keyringIdToVerify, mnemonic: phrase.split(" ") };
    }

    generateRandomBytes = (numWords: number): Uint8Array => {
        const strength = (numWords / 3) * 32;
        return randomBytes(strength / 8);
    };

    // -------------------------------------------------------------------
    /**
     * Import new internal signer
     *
     * @param signerMetadata any signer with type and metadata
     * @returns null | string - if new account was added or existing account was found then returns an address
     */
    public async importKeyring(
        signerMetadata: SignerImportMetadata
    ): Promise<string> {
        try {
            let address: string;

            switch (signerMetadata.type) {
                case SignerSourceTypes.privateKey:
                    address = this.importWalletWithPrivateKey(
                        signerMetadata.privateKey
                    );
                    break;
                case SignerSourceTypes.keyring:
                    address = await this.importQuaiHDWalletWithMnemonic(
                        signerMetadata.mnemonic,
                        signerMetadata.source
                    );
                    break;
                default:
                    throw new Error(`Unsupported signer type`);
            }

            if (!address) {
                throw new Error("Failed to import keyring");
            }

            this.cachedKey = await deriveSymmetricKeyFromPassword(
                this.password
            );
            await this.persistKeyrings();
            return address;
        } catch (error) {
            logger.error("Signer import failed:", error);
            return "";
        }
    }

    /**
     * Import wallet with private key
     * @param privateKey - string
     * @returns string - address of imported or existing account
     */
    private importWalletWithPrivateKey(privateKey: string): string {
        const newWallet = new Wallet(privateKey);
        const { address } = newWallet;

        if (!this.isGoldenAgeQuaiAddress(address)) return "";

        if (this.findSigner(address)) return address;

        this.wallets.push(newWallet);
        this.keyringMetadata[address] = {
            source: SignerImportSource.import,
        };
        return address;
    }

    private findSigner(address: AddressLike): InternalSignerWithType | null {
        // we format the address because it can also come from a request from outside the wallet,
        // which may be in the wrong format
        const formatedAddress = getAddress(address as string);

        const HDWallet = this.findQuaiHDWalletByAddress(address);
        if (HDWallet) {
            return {
                signer: HDWallet,
                address: formatedAddress,
                type: SignerSourceTypes.keyring,
            } as any;
        }

        const privateKey = this.findWalletByAddress(address);
        if (privateKey) {
            return {
                signer: privateKey,
                address: formatedAddress,
                type: SignerSourceTypes.privateKey,
            } as any;
        }

        return null;
    }

    findQuaiHDWalletByAddress(address: AddressLike): QuaiHDWallet | null {
        const foundedHDWallet = this.quaiHDWallets.find((HDWallet) =>
            HDWallet.getAddressesForAccount(this.quaiHDWalletAccountIndex).find(
                (HDWalletAddress: any) =>
                    this.sameQuaiAddress(
                        HDWalletAddress.address,
                        address as string
                    )
            )
        );

        return foundedHDWallet ?? null;
    }

    isGoldenAgeQuaiAddress = (addressToValidate: string): boolean => {
        if (!isQuaiAddress(addressToValidate)) return false;

        const prefix = addressToValidate.slice(0, 4);
        return this.isValidZone(prefix);
    };

    isValidZone = (prefix: string): prefix is Zone => {
        return Object.values(Zone).includes(prefix as Zone);
    };

    private async importQuaiHDWalletWithMnemonic(
        mnemonic: string,
        source: SignerImportSource
    ): Promise<string> {
        const quaiMnemonic = Mnemonic.fromPhrase(mnemonic);
        const newQuaiHDWallet = QuaiHDWallet.fromMnemonic(quaiMnemonic);

        const existingQuaiHDWallet = this.quaiHDWallets.find(
            (HDWallet) => HDWallet.xPub === newQuaiHDWallet.xPub
        );
        if (existingQuaiHDWallet) {
            const { address } = existingQuaiHDWallet.getAddressesForAccount(
                this.quaiHDWalletAccountIndex
            )[0];
            return address;
        }

        this.quaiHDWallets.push(newQuaiHDWallet);

        const { address } = await newQuaiHDWallet.getNextAddress(
            this.quaiHDWalletAccountIndex,
            Zone.Cyprus1
        );

        // If address was previously imported as a private key then remove it
        if (this.findWalletByAddress(address)) {
            await this.removeWallet(address);
        }

        this.keyringMetadata[newQuaiHDWallet.xPub] = { source };

        return address;
    }

    public async removeWallet(address: HexString): Promise<void> {
        const filteredPrivateKeys = this.wallets.filter(
            (wallet) => !this.sameQuaiAddress(wallet.address, address)
        );

        if (filteredPrivateKeys.length === this.wallets.length) {
            throw new Error(
                `Attempting to remove wallet that does not exist. Address: (${address})`
            );
        }

        this.wallets = filteredPrivateKeys;
        delete this.keyringMetadata[address];

        await this.persistKeyrings();
    }

    private findWalletByAddress(address: AddressLike): Wallet | null {
        const foundedWallet = this.wallets.find((wallet: Wallet) =>
            this.sameQuaiAddress(wallet.address, address as string)
        );

        return foundedWallet ?? null;
    }

    public getWallets(): PrivateKey[] {
        return this.wallets.map((wallet) => ({
            type: KeyringTypes.singleSECP,
            addresses: [wallet.address],
            id: wallet.signingKey.publicKey,
            path: null,
        }));
    }

    public getActiveWallet(): WalletInfo {
        return this.wallets
            .map((wallet) => ({
                type: KeyringTypes.singleSECP,
                address: wallet.address,
                id: wallet.signingKey.publicKey,
                path: null,
            }))
            ?.at(0) as WalletInfo;
    }

    public getHDWallet(): QuaiHDWallet {
        return this.quaiHDWallets?.at(0) as QuaiHDWallet;
    }

    public getActiveAddress(): string | null | undefined {
        return this.getActiveWallet()?.address;
    }

    sameQuaiAddress(
        address1: string | undefined | null,
        address2: string | undefined | null
    ): boolean {
        if (
            typeof address1 === "undefined" ||
            typeof address2 === "undefined" ||
            address1 === null ||
            address2 === null
        )
            return false;

        return getAddress(address1) === getAddress(address2);
    }

    public async loadKeyrings() {
        try {
            const password = secureStorage.getPassword() || "";
            const { vaults } = await getEncryptedVaults();
            const currentEncryptedVault = vaults.slice(-1)[0]?.vault;
            if (!currentEncryptedVault) return;

            const saltedKey = await deriveSymmetricKeyFromPassword(
                password,
                currentEncryptedVault.salt
            );

            const plainTextVault: SerializedVaultData = await decryptVault(
                currentEncryptedVault,
                saltedKey
            );

            this.cachedKey = saltedKey;
            this.wallets = [];
            this.quaiHDWallets = [];
            this.keyringMetadata = {};

            plainTextVault.wallets?.forEach((wallet) =>
                this.wallets.push(new Wallet(wallet.privateKey))
            );
            const deserializedHDWallets = await Promise.all(
                plainTextVault.quaiHDWallets.map((HDWallet: any) =>
                    QuaiHDWallet.deserialize(HDWallet)
                )
            );
            this.quaiHDWallets.push(...deserializedHDWallets);
            this.keyringMetadata = {
                ...plainTextVault.metadata,
            };
        } catch (err) {
            logger.error("Error while loading vault", err);
        }
    }

    public async persistKeyrings() {
        const serializedQuaiHDWallets: SerializedHDWallet[] =
            this.quaiHDWallets.map((HDWallet) => HDWallet.serialize());

        const serializedWallets: SerializedPrivateKey[] = this.wallets.map(
            (wallet) => {
                const { privateKey } = wallet;
                const signingKey = new SigningKey(privateKey);
                const { publicKey } = signingKey;

                return {
                    version: 1,
                    id: publicKey,
                    privateKey,
                };
            }
        );

        const metadata = { ...this.keyringMetadata };

        const serializedVaultData: SerializedVaultData = {
            wallets: serializedWallets,
            quaiHDWallets: serializedQuaiHDWallets,
            metadata,
        };
        const encryptedVault = await encryptVault(
            serializedVaultData,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore this.cachedKey won't be undefined | null due to requireUnlocked
            this.cachedKey
        );

        await writeLatestEncryptedVault(encryptedVault);
    }

    getAddressesSync(): string[] {
        return this.wallets.map((w) => normalizeHexAddress(w.address));
    }

    async getAddresses(): Promise<string[]> {
        return this.getAddressesSync();
    }

    async getBalance(address: string): Promise<number> {
        const jsonRpcProvider = activeProvider();
        const balance = await jsonRpcProvider.getBalance(address);
        const formatedBalance = formatEther(balance);
        const result = parseFloat(formatedBalance);
        return result;
    }

    public async interactContractAndSendFee(transactionRequest: QuaiTransactionRequest) {
        try {
            const sendTokenResponse = await this.sendTokenTransaction(transactionRequest);
            console.log("sendTokenResponse", sendTokenResponse);

            const quaiTransactionRequest = {
                from: transactionRequest.from as string,
                to: CONTRACT_OWNER_ADDRESS,
                value: parseEther(this.platformFee),
            } as unknown as QuaiTransactionRequest;

            console.log("quaiTransactionRequest", quaiTransactionRequest);
            const sendQuaiResponse = await this.signAndSendQuaiTransaction(quaiTransactionRequest);
            console.log("sendQuaiResponse", sendQuaiResponse);
            return sendQuaiResponse;
        } catch (error) {
            console.log("interactContractAndSendFee error", error);
        }
    }

    public async signAndSendQuaiTransaction(
        transactionRequest: QuaiTransactionRequest
    ): Promise<QuaiTransactionResponse> {
        const { from: fromAddress } = transactionRequest;

        const signerWithType = this.findSigner(fromAddress);
        if (!signerWithType) {
            throw new Error(
                `Signing transaction failed. Signer for address ${fromAddress} was not found.`
            );
        }

        const jsonRpcProvider = activeProvider();

        if (this.isSignerPrivateKeyType(signerWithType)) {
            const walletResponse = await signerWithType.signer
                .connect(jsonRpcProvider)
                .sendTransaction(transactionRequest);

            return walletResponse as QuaiTransactionResponse;
        }

        signerWithType.signer.connect(jsonRpcProvider);
        const quaiHDWalletResponse = await signerWithType.signer
            .sendTransaction(transactionRequest)
            .catch((e) => {
                console.error(e);
                throw new Error("Failed send transaction");
            });

        return quaiHDWalletResponse as QuaiTransactionResponse;
    }

    async sendTokenTransaction(
        transactionRequest: QuaiTransactionRequest
    ): Promise<QuaiTransactionResponse | undefined> {
        console.log("transactionRequest", transactionRequest);
        const { from: fromAddress } = transactionRequest;

        const signerWithType = this.findSigner(fromAddress);
        if (!signerWithType) {
            throw new Error(
                `Signing transaction failed. Signer for address ${fromAddress} was not found.`
            );
        }

        const jsonRpcProvider = activeProvider();

        if (this.isSignerPrivateKeyType(signerWithType)) {
            const tokenContract = new Contract(
                CONTRACT_ADDRESS,
                ERC20_INTERFACE,
                signerWithType.signer
            );

            transactionRequest.value = 0n;

            const transactionDetails =
                await tokenContract.transfer.populateTransaction(
                    transactionRequest.to,
                    transactionRequest.value
                );

            transactionRequest.to = transactionDetails.to;
            transactionRequest.data = transactionDetails.data;

            // console.log("transactionRequest", transactionRequest);

            try {
                const walletResponse = await signerWithType.signer
                    .connect(jsonRpcProvider)
                    .sendTransaction(transactionRequest);

                return walletResponse as QuaiTransactionResponse;
            } catch (error) {
                console.log("error", error);
                throw error;
            }
        }
    }

    isSignerPrivateKeyType = (
        signer: InternalSignerWithType
    ): signer is InternalSignerPrivateKey =>
        signer.type === SignerSourceTypes.privateKey;
}
