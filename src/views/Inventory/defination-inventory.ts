export enum ButtonName {
    Inventory = "Inventory",
    Badges = "Badges",
    Fusion = "Fusion",
    Player = "Player",
}

export interface Button {
    name: ButtonName;
    label: string;
}
