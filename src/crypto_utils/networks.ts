/* eslint-disable prefer-const */
import { ChainData, QUAI_CONTEXTS, QUAI_NETWORK } from "./constants/networks";
import type { Slip44CoinType } from "./constants";
import type { HexString, UNIXTime } from "@/storage/types";
import { quais, Wallet } from "quais";
import { QFPTokenABI } from "./constants/QFPToken";
import type { QuaiTransactionRequest } from "quais/providers";

/**
 * Each supported network family is generally incompatible with others from a
 * transaction, consensus, and/or wire format perspective.
 */
export type NetworkFamily = "EVM";

// Should be structurally compatible with FungibleAsset or much code will
// likely explode.
export type NetworkBaseAsset = {
    name: string;
    symbol: string;
    decimals: number;
    contractAddress?: string;
    coinType?: Slip44CoinType;
    chainID: string;
    metadata: any;
};

/**
 * Represents a cryptocurrency network; these can potentially be L1 or L2.
 */
export type Network = {
    // Considered a primary key; two Networks should never share a name.
    name: string;
    baseAsset: NetworkBaseAsset;
    family: NetworkFamily;
    chainID?: string;
    derivationPath?: string;
};

/**
 * Mixed in to any other type, gives it the property of belonging to a
 * particular network. Often used to delineate contracts or assets that are on
 * a single network to distinguish from other versions of them on different
 * networks.
 */
export type NetworkSpecific = {
    homeNetwork: AnyNetwork;
};

/**
 * A smart contract on any network that tracks smart contracts via a hex
 * contract address.
 */
export type SmartContract = NetworkSpecific & {
    contractAddress: HexString;
};

/**
 * An EVM-style network which *must* include a chainID.
 */
export type EVMNetwork = Network & {
    chainID: string;
    family: "EVM";
    /**
     * Provided for custom networks
     */
    blockExplorerURL?: string;
    chains?: ChainData[];
    isQuai?: boolean;
};

export type ChainIdWithError = {
    chainId: string;
    error: boolean;
};

/**
 * Union type that allows narrowing to particular network subtypes.
 */
export type AnyNetwork = EVMNetwork;

/**
 * An EVM-style block identifier, including difficulty, block height, and
 * self/parent hash data.
 */
export type EVMBlock = {
    hash: string;
    parentHash: string;
    difficulty: bigint;
    blockHeight: number;
    timestamp: UNIXTime;
    network: EVMNetwork;
};

/**
 * An EVM-style block identifier that includes the base fee, as per EIP-1559.
 */
export type EIP1559Block = EVMBlock & {
    baseFeePerGas: bigint;
};

/**
 * A pre- or post-EIP1559 EVM-style block.
 */
export type AnyEVMBlock = EVMBlock | EIP1559Block;

/**
 * Base EVM transaction fields; these are further specialized by particular
 * subtypes.
 */
export type EVMTransaction = {
    hash: string;
    from: HexString;
    to?: HexString;
    gasLimit: bigint;
    gasPrice: bigint | null;
    maxFeePerGas: bigint | null;
    maxPriorityFeePerGas: bigint | null;
    input: string | null;
    nonce: number;
    value: bigint;
    blockHash: string | null;
    blockHeight: number | null;
    asset: NetworkBaseAsset;
    network: EVMNetwork;
    type: KnownTxTypes | null;
    externalGasLimit?: bigint;
    externalGasPrice?: bigint;
    externalGasTip?: bigint;
};

/**
 * A legacy (pre-EIP1559) EVM transaction, whose type is fixed to `0` and whose
 * EIP1559-related fields are mandated to be `null`, while `gasPrice` must be
 * set.
 */
export type LegacyEVMTransaction = EVMTransaction & {
    gasPrice: bigint;
    type: 0 | null;
    maxFeePerGas: null;
    maxPriorityFeePerGas: null;
};

/**
 * A legacy (pre-EIP1559) EVM transaction _request_, meaning only fields that
 * are used to post a transaction for inclusion are required, including the gas
 * limit used to limit the gas expenditure on a transaction. This is used to
 * request a signed transaction, and does not include signature fields.
 *
 * Nonce is permitted to be `undefined` as Pelagus internals can and often do
 * populate the nonce immediately before a request is signed.
 *
 * On networks that roll up to ethereum - the rollup fee is directly proportional
 * to the size (in bytes) of the input of a given transaction.  Networks that do
 * not roll up will have a rollup fee of 0.
 *
 * There is some intentional tech debt here in that we are adding both estimatedRollupFee
 * and estimatedRollupGwei as mandatory properties of LegacyEVMTransactionRequests.
 *
 * This is not strictly true - since there are networks that implement LegacyEVMTransactions
 * which do not roll up to Ethereum. Once we choose to support one of those networks -
 * we'll probably need to split this type into something like LegacyEVMTransactionRequest and
 * LegacyEvmRollupTransactionRequest.
 */
export type LegacyEVMTransactionRequest = Pick<
    LegacyEVMTransaction,
    "gasPrice" | "type" | "from" | "to" | "input" | "value" | "network"
> & {
    chainID: LegacyEVMTransaction["network"]["chainID"];
    gasLimit: bigint;
    estimatedRollupFee: bigint;
    estimatedRollupGwei: bigint;
    nonce?: number;
};

/**
 * Transaction types attributes are expanded in the https://eips.ethereum.org/EIPS/eip-2718 standard which
 * is backward compatible. This means that it's enough for us to expand only the accepted tx types.
 * On the other hand we have yet to find other types from the range being used, so let's be restrictive,
 * and we can expand the range afterwards. Types we have encountered so far:
 * 0 - plain jane
 * 1 - EIP-2930
 * 2 - EIP-1559 transactions
 * 100 - EIP-2718 on Arbitrum
 */
export const KNOWN_TX_TYPES = [0, 1, 2, 100] as const;
export type KnownTxTypes = (typeof KNOWN_TX_TYPES)[number];
export function isKnownTxType(arg: unknown): arg is KnownTxTypes {
    return (
        arg !== undefined &&
        arg !== null &&
        (KNOWN_TX_TYPES as unknown as number[]).includes(Number(arg))
    );
}

/**
 * An EIP1559 EVM transaction, whose type is set to `1` or `2` per EIP1559 and
 * whose EIP1559-related fields are required, while `gasPrice` (pre-EIP1559) is
 * mandated to be `null`.
 */
export type EIP1559Transaction = EVMTransaction & {
    gasPrice: null;
    type: KnownTxTypes;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
};

/**
 * An EIP1559 EVM transaction _request_, meaning only fields used to post a
 * transaction for inclusion are required, including the gas limit used to
 * limit the gas expenditure on a transaction. This is used to request a signed
 * transaction, and does not include signature fields.
 *
 * Nonce is permitted to be `undefined` as Pelagus internals can and often do
 * populate the nonce immediately before a request is signed.
 */
export type EIP1559TransactionRequest = Pick<
    EIP1559Transaction,
    | "from"
    | "to"
    | "type"
    | "input"
    | "value"
    | "maxFeePerGas"
    | "maxPriorityFeePerGas"
    | "network"
> & {
    externalGasLimit?: bigint;
    externalGasPrice?: bigint;
    externalGasTip?: bigint;
    gasLimit: bigint;
    chainID: EIP1559Transaction["network"]["chainID"];
    nonce?: number;
};

export type TransactionRequest =
    | EIP1559TransactionRequest
    | LegacyEVMTransactionRequest;

export type TransactionRequestWithNonce = TransactionRequest & {
    nonce: number;
};

/**
 * EVM log metadata, including the contract address that generated the log, the
 * full log data, and the indexed log topics.
 */
export type EVMLog = {
    contractAddress: HexString;
    data: HexString;
    topics: HexString[];
};

/**
 * A confirmed EVM transaction that has been included in a block. Includes
 * information about the gas actually used to execute the transaction, as well
 * as the block hash and block height at which the transaction was included.
 */

/**
 * An EVM transaction that failed to be confirmed. Includes information about
 * the error if available.
 */
export type FailedConfirmationEVMTransaction = EVMTransaction & {
    status: 0;
    error?: string;
    blockHash: null;
    blockHeight: null;
};

/**
 * An almost-signed EVM transaction, meaning a transaction that knows about the
 * signature fields but may not have them all populated yet.
 */
export type AlmostSignedEVMTransaction = EVMTransaction & {
    r?: string;
    s?: string;
    v?: number;
};

/**
 * An EVM transaction with signature fields filled in and ready for broadcast
 * to the network.
 */
type SignedEIP1559Transaction = EVMTransaction & {
    r: string;
    s: string;
    v: number;
};

/**
 * A Legacy EVM transaction with signature fields filled in and ready for broadcast
 * to the network.
 */
export type SignedLegacyEVMTransaction = LegacyEVMTransaction & {
    r: string;
    s: string;
    v: number;
};

export type SignedTransaction =
    | SignedEIP1559Transaction
    | SignedLegacyEVMTransaction;


export type BlockPrices = {
    network: Network;
    blockNumber: number;
    baseFeePerGas: bigint;
    /**
     * A choice of gas price parameters with associated confidence that a
     * transaction using those parameters will be included in the next block.
     */
    estimatedPrices: BlockEstimate[];
    /**
     * Whether these prices were estimated locally or via a third party provider
     */
    dataSource: "local";
};

/**
 * An estimate of the confidence that a given set of gas price parameters
 * will result in the inclusion of a transaction in the next block.
 */
export type BlockEstimate = {
    confidence: number;
    /**
     * For legacy (pre-EIP1559) transactions, the gas price that results in the
     * above likelihood of inclusion.
     */
    price?: bigint;
    /**
     * For EIP1559 transactions, the max priority fee per gas that results in the
     * above likelihood of inclusion.
     */
    maxPriorityFeePerGas: bigint;
    /**
     * For EIP1559 transactions, the max fee per gas that results in the above
     * likelihood of inclusion.
     */
    maxFeePerGas: bigint;
};

/**
 * Tests whether two networks should be considered the same. Verifies family,
 * chainID, and name.
 */
export function sameNetwork(
    network1: AnyNetwork,
    network2: AnyNetwork
): boolean {
    return (
        network1.family === network2.family &&
        network1.chainID === network2.chainID
    );
}

/**
 * Returns a 0x-prefixed hexadecimal representation of a number or string chainID
 * while also handling cases where an already hexlified chainID is passed in.
 */
export function toHexChainID(chainID: string | number): string {
    if (typeof chainID === "string" && chainID.startsWith("0x"))
        return chainID.toLowerCase();

    return `0x${BigInt(chainID).toString(16)}`;
}

export const sameChainID = (chainID: string, other: string): boolean => {
    return toHexChainID(chainID) === toHexChainID(other);
};

export const activeProvider = (): quais.JsonRpcProvider => {
    const fromChain = QUAI_NETWORK.chains?.find(
        (x) => x.shard === "cyprus-1"
    ) as ChainData;
    console.log("-------");
    
    const provider = new quais.JsonRpcProvider(fromChain.rpc);
    return provider;
};

export async function fetchActivity(address: string) {
    const chainData = QUAI_NETWORK.chains?.find(
        (x) => x.shard === "cyprus-1"
    ) as ChainData;

    let explorerEndpoint = chainData?.blockExplorerUrl;
    let accountActivity: any[] = [];
    if (explorerEndpoint) {
        try {
            let pendingData = await fetch(
                `${explorerEndpoint}/api?module=account&action=pendingtxlist&address=${address}`
            );

            let pendingDataJSON = await pendingData.json();
            // Return if the request was successful
            if (pendingDataJSON.status === "1") {
                // add shard and address to each result
                pendingDataJSON.result.forEach((item: any) => {
                    item.shard = chainData.shard;
                    item.lookupAddress = address;
                    item.status = "pending";
                });

                accountActivity = accountActivity.concat(
                    pendingDataJSON.result
                );
            }
        } catch (e) {
            console.log(e);
        }

        try {
            let tokenTxData = await fetch(
                `${explorerEndpoint}/api?module=account&action=tokentx&address=${address}`
            );
            if (tokenTxData.ok) {
                let tokenTxDataJSON = await tokenTxData.json();
                // Return if the request was successful
                if (tokenTxDataJSON.status === "1") {
                    // add shard and address to each result
                    tokenTxDataJSON.result.forEach((item: any) => {
                        item.shard = chainData.shard;
                        item.lookupAddress = address;
                        item.status = "confirmed";
                    });

                    accountActivity = accountActivity.concat(
                        tokenTxDataJSON.result
                    );
                }
            }
        } catch (e) {
            console.log(e);
        }

        try {
            let confirmedData = await fetch(
                `${explorerEndpoint}/api?module=account&action=txlist&address=${address}`
            );

            let confirmedDataJSON = await confirmedData.json();
            // Return if the request was successful
            if (confirmedDataJSON.status === "1") {
                // add shard and address to each result
                confirmedDataJSON.result.forEach((item: any) => {
                    item.shard = chainData.shard;
                    item.lookupAddress = address;
                    item.status = "confirmed";
                });

                accountActivity = accountActivity.concat(
                    confirmedDataJSON.result
                );
            }
        } catch (e) {
            console.log(e);
        }
    }

    const activityData = accountActivity;
    // Remove undefined values
    let filteredActivityData = activityData.filter(
        (item) => item !== undefined
    );

    let activity: any[] = [];
    filteredActivityData.forEach((item) => {
        activity = activity.concat(item);
    });

    // sort pending first and by timestamp second
    activity.sort((a, b) => {
        if (a.status === "pending" && b.status === "confirmed") {
            return -1;
        } else if (a.status === "confirmed" && b.status === "pending") {
            return 1;
        } else {
            return Number(b.timeStamp) - Number(a.timeStamp);
        }
    });

    // set the type of each activity item
    // remove duplicate hashes and set the duplicates to transfer
    let uniqueActivity: any[] = [];
    let hashes: any[] = [];
    activity.forEach((item) => {
        if (!hashes.includes(item.hash)) {
            uniqueActivity.push(item);
            hashes.push(item.hash);
            let send =
                item.lookupAddress.trim().toLowerCase() ===
                item.from.trim().toLowerCase();
            if (send) {
                item.type = "send";
            } else {
                item.type = "receive";
            }
        } else {
            let index = uniqueActivity.findIndex((i) => i.hash === item.hash);
            if (
                index !== -1 &&
                uniqueActivity[index].tokenSymbol === undefined
            ) {
                uniqueActivity[index].type = "transfer";
            }
        }
    });

    return uniqueActivity;
}

export function getAddressLinkToExplorer(address: string) {
    return `${QUAI_NETWORK.chains?.find((x) => x.shard === "cyprus-1")
        ?.blockExplorerUrl
        }/address/${address}`;
}

export function getTxLinkToExplorer(txHash: string) {
    return `${QUAI_NETWORK.chains?.find((x) => x.shard === "cyprus-1")
        ?.blockExplorerUrl
        }/tx/${txHash}`;
}

export function sendAssets(){
    
}