interface IItemDef {
    id: number;
    Name: string;
    Code: string;
    Description: string | null;
    Grade: string;
    Effect: null;
    RarityPoint: number;
    Attachable: null;
    Stackable: boolean;
    Type: string;
    ImageUrl: string;
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
    Tradable: null;
    ItemCount: number;
    ItemDef: IItemDef;
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
}
export interface IFusion {
    id: number;
    Name: string;
    Code: string;
    ResourcesItemDefIds: string; //IItemDefFusion[];
    TreasureId: 2;
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
