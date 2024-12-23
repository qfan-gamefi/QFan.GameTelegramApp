export enum ButtonName {
    Inventory = "Inventory",
    Badges = "Badges",
    Fusion = "Fusion",
    History = "History",
}

export interface Button {
    name: ButtonName;
    label: string;
}
