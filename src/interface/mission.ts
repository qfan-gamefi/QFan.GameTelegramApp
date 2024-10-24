export interface IMission {
    id: number;
    name: string;
    status: string;
    isStatus: boolean;
    attributes: {
        type: string
        QA: any
    }
    
}

export interface IMissionReward {
    id: number;
    attributes: {
        refId: number;
        status: string;
    };
}
