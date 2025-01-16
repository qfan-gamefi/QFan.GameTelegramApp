interface IItemDef {
    id: number;
    Name: string;
    Code: string;
    Description: string | null;
    Grade: string;
    Effect: any;
    RarityPoint: number;
    Attachable: any;
    Stackable: boolean;
    Type: string;
    ImageUrl: string;
    Consumable: boolean;
}

export interface IItemInventory {
    id: number;
    Name: string;
    Code: string;
    Description: string | null;
    AttachmentId: number | null;
    InventoryId: number;
    ItemDefId: number;
    Status: string;
    Stackable: boolean;
    Tradable: boolean;
    ItemCount: number;
    ItemDef: IItemDef;
    Configuration: any
    ConfigurationArr?: any
    DefaultInStack: boolean
}

export interface IDetailPlayer {
    id: number;
    Name: string;
    Code: string;
    Description: string | null;
    AttachmentId: number | null;
    InventoryId: number;
    ItemDefId: number;
    Status: string;
    Stackable: boolean;
    Tradable: boolean;
    ItemCount: number;
    ItemDef: IItemDef;
    Configuration: any
    ConfigurationText: string
    ConfigurationArr?: any
    DefaultInStack: boolean
}

export interface IInventory {
    id: number;
    UserId: string;
    Description: string | null;
    Status: string;
    Items: IItemInventory[];
}

export enum EItemDefType {
    Common = "Common",
    Medal = "Medal",
}

export interface IItemDefFusion {
    ItemDefId: number;
    Count: number;
    ImageUrl: string;
    CashValue: string;
    AutoCash: number;
    AutoCashType: string
}
export interface IFusionBase {
    id: number;
    Name: string;
    Code: string;
    TreasureId: number;
    TreasureCount: number;
    Active: boolean;
    Treasure: {
        id: number;
        Name: string;
        Description: string;
        AutoRefill: boolean;
        TreasurePlayerId: string;
        SuccessRate: number;
        Status: "A";
        ImageUrl: string;
    };
}

export interface IFusion extends IFusionBase {
    ResourcesItemDefIds: IItemDefFusion[];
}

export interface IFusionString extends IFusionBase {
    ResourcesItemDefIds: string;
}
