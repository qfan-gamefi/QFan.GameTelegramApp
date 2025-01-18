import { IFusion, IItemDefFusion, IItemInventory } from "@/interface";

export function renderTitleKey(key: string) {
    return key
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase());
}

export const formatNumber = (num: number) => {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 10000) {
        return `${(num / 1000).toFixed(0)}K`;
    } else {
        return num?.toString();
    }
};

export const disableFusion = (
    item: IFusion,
    dataInfo,
    arrInventory: IItemInventory[]
) => {
    const arrRow = item.ResourcesItemDefIds;
    const balance = dataInfo?.attributes?.qpoint?.data?.attributes?.balance;

    const hasAutoCash = arrRow.some((item) => "AutoCash" in item);

    if (hasAutoCash) {
        const result = arrRow?.map((item) => {
            if (item?.AutoCashType === "QFP") {
                return balance >= item?.CashValue;
            } else {
                return true;
            }
        });

        const hasFalseValue = !result.some((value) => value === false);

        return hasFalseValue ? "" : "disable";
    } else {
        const result = arrRow?.every((itemA) => {
            const matchingItemB = arrInventory?.find(
                (itemB) => itemB.ItemDefId === itemA.ItemDefId
            );
            return matchingItemB
                ? itemA.Count <= matchingItemB.ItemCount
                : false;
        });

        return result ? "" : "disable";
    }
};

export const renderConfiguration = (configuration: string) => {    
    if (!configuration || configuration === "undefined") {
        return 0;
    }
    const dataParse = JSON.parse(configuration)
    const stats = dataParse?.PlayerStat;
    if (!stats) {
        return 0; 
    }
    const total = Math.floor(
        stats.Tackle +
        stats.Stamina +
        stats.Dribbling +
        stats.Speed +
        stats.Confidence
    );
    return total;
}

export const renderItemFusion = (item: IItemDefFusion, type: "bg" | "count", arrInventory: IItemInventory[], dataInfo: any) => {
    const { ItemDefId, AutoCash, CashValue, Count } = item || {};
    const filterIdItem: IItemInventory = arrInventory?.find(
        (el) => el.ItemDefId === ItemDefId
    );
    const dataBalance = dataInfo?.attributes?.qpoint?.data?.attributes;
    const formatBalace = formatNumber(dataBalance?.balance);
    const countItem = filterIdItem?.ItemCount || 0;
    const countHash = Count || 0;

    if (type === "count") {
        if (AutoCash && AutoCash === 1) {
            const formatCashValue = formatNumber(Number(CashValue));
            return `${formatBalace}/${formatCashValue}`;
        } else {
            return `${countItem}/${countHash}`;
        }
    }
    if (type === "bg") {
        const bgRed = "bg-[#FF0000]";
        const bgGreen = "bg-[#2cde00]";

        if (AutoCash && AutoCash === 1) {
            return dataBalance?.balance >= CashValue ? bgGreen : bgRed;
        } else {
            return countItem >= countHash ? bgGreen : bgRed;
        }
    }
}
