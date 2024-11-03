interface BtnHeader {
    name: EButtonName;
    label: EButtonLabel;
}

export type TabTypeBS = "buy" | "sell";
export type EFeeVat = "OrderFee" | "VAT";

enum EBtnCategoryName {
    ALL = "All",
    EVENT_ITEM = "EventItem",
    PLAYER = "Player",
}
enum EBtnCategoryLabel {
    ALL = "All",
    EVENT_ITEM = "Event Item",
    PLAYER = "Player",
}

export const btnCategory = [
    {
        label: EBtnCategoryLabel.ALL,
        name: EBtnCategoryName.ALL,
    },
    {
        label: EBtnCategoryLabel.EVENT_ITEM,
        name: EBtnCategoryName.EVENT_ITEM,
    },
    {
        label: EBtnCategoryLabel.PLAYER,
        name: EBtnCategoryName.PLAYER,
    },
];

export enum EButtonName {
    MarketPlace = "Market",
    MyOrders = "Orders",
    Transactions = "Transactions",
}
export enum EButtonLabel {
    MarketPlace = "Market Place",
    MyOrders = "My Orders",
    Transactions = "Transactions",
}

export const btnShop = [
    {
        name: EButtonName.MarketPlace,
        label: EButtonLabel.MarketPlace,
    },
    { name: EButtonName.MyOrders, label: EButtonLabel.MyOrders },
    {
        name: EButtonName.Transactions,
        label: EButtonLabel.Transactions,
    },
] as BtnHeader[];

export interface ItemDefShop {
    id: number;
    Name: string;
    Code: string;
    Description: string;
    Grade: string;
    Effect: string | null;
    RarityPoint: number;
    Attachable: boolean | null;
    Stackable: boolean;
    Consumable: boolean | null;
    ConsumeData: string | null;
    Type: string;
    ImageUrl: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface ItemShop {
    id: number;
    ItemDefId: number;
    GoodBuyPrice: number;
    GoodSellPrice: number;
    Side: "S" | "B";
    GoodPrice: number;
    GoodPriceType: string;
    createdAt: string | null;
    updatedAt: string | null;
    deletedAt: string | null;
    ItemDef: ItemDefShop;
    TotalBuy: number;
    TotalSell: number;
}

export interface IDetailCart extends ItemShop {}

export interface IOrderList {
    id: number;
    UserId: string;
    ItemDefId: number;
    Price: number;
    PriceType: string;
    Count: number;
    OriginCount: number;
    Side: "B" | "S";
    RefItemOrderId: number | null;
    RefItemId: number | null;
    Status: string;
    createdAt: Date; // or Date if you want to parse it into a Date object
    updatedAt: Date; // or Date if you want to parse it into a Date object
    deletedAt: Date | null;
    ItemDef: ItemDefShop;
}

export interface IFeeVat {
    id: number;
    ConfigType: "FEE";
    ConfigCode: EFeeVat;
    ConfigValue: {
        Value: string;
        ValueUnit: string;
        ValueType: string;
        Min: number;
        Max: number;
    };
    ConfigDescription: string;
    Status: "A";
}

export interface IInfoWallet {
    id: number;
    playerId: string;
    walletType: "ON_CHAIN";
    address: string;
    balance: number;
    unit: "QUAI";
    isActive: boolean;
}

export interface IItemOrderConfirm {
    ItemDefId: number;
    countBuy: number;
    countSell: number;
    priceBuy: number;
    priceSell: number;
    priceType: "QFP";
    ItemDef: ItemDefShop;
}

export const selectOptions = [
    { value: "All", text: "All" },
    { value: "Buy", text: "Buy" },
    { value: "Sell", text: "Sell" },
];

export const selectOptionsStatus = [
    { value: "All", text: "All" },
    { value: "A", text: "Active" },
    { value: "FF", text: "Fulfilled" },
    { value: "CC", text: "Cancel" },
];

export type BuySellOption = "Buy" | "Sell" | "All";
export type StatusOption = "A" | "FF" | "CC" | "All";

export interface IMarketTransactions {
    playerId: string;
    amount: number;
    unit: string;
    walletType: string;
    tranType: string;
    opr: string;
    status: WalletTransactionStatus;
    address: string;
    hash: string;
    fee: number;
    message: string | null;
    id: number;
    createdAt: Date;
    updatedAt: Date;
  }

  export enum WalletTransactionStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    PROCESSING = 'PROCESSING',
  }
  
