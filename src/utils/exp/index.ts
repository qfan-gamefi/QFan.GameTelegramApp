import type { ILevel } from "@/interface";

export const calcLevel = (data: ILevel[], targetExp: number) => {
    for (let i = 0; i < data?.length - 1; i++) {
        const currentExp = parseInt(data[i]?.attributes?.exp);
        const nextExp = parseInt(data[i + 1]?.attributes?.exp);

        if (targetExp >= currentExp && targetExp < nextExp) {
            return data[i];
        }
    }

    if (targetExp >= parseInt(data[data.length - 1].attributes.exp)) {
        return data[data.length - 1];
    }

    if (targetExp < parseInt(data[0].attributes.exp)) {
        return null;
    }

    return null;
};

export const nextExpLevel = (dataAllLv: ILevel[], currentLv: ILevel) => {
    return dataAllLv?.find(
        (item) =>
            Number(item?.attributes?.level) ==
            Number(currentLv?.attributes?.level) + 1
    );
};

export const calcExpPercentage = (
    dataExpCurrent: number,
    levelAll: ILevel[],
    currentLv: ILevel
): number => {
    const beforeDataLevel = levelAll?.find(
        (item) =>
            Number(item?.attributes?.level) ==
            Number(currentLv?.attributes?.level)
    );

    const nextDataLevel = nextExpLevel(levelAll, currentLv);

    if (!nextDataLevel?.attributes?.exp) return 100;
    // if (!beforeDataLevel || !nextDataLevel) {
    //     return 0;
    // }

    const beforeExp = Number(beforeDataLevel?.attributes?.exp);
    const nextExp = Number(nextDataLevel?.attributes?.exp);

    return ((dataExpCurrent - beforeExp) / (nextExp - beforeExp)) * 100;
};
