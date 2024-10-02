interface QPointAttributes {
    balance: string;
    lastTakeRewardTime: string;
    nextTakeRewardTime: string;
    rewardAmount: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    rewardScheduleHour: number;
}

interface QPointData {
    id: number;
    attributes: QPointAttributes;
}

interface PlayerAttributes {
    playerId: string;
    firstName: string;
    lastName: string;
    refererCode: string;
    nickName: string | null;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    level: number;
    exp: string;
    qpoint: {
        data: QPointData;
    };
}

export interface IPlayer {
    id: number;
    attributes: PlayerAttributes;
}
