export interface IMission {
    id: number;
    name: string;
    status: string;
    isStatus: boolean;
}

export interface IMissionReward {
    id: number;
    attributes: {
        refId: number;
        status: string;
    };
}
