import { IFusion, IItemDefFusion, IItemInventory } from "@/interface";
import { IInfoWallet } from "../Shop/defination";

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
    arrInventory: IItemInventory[],
    infoWallet: IInfoWallet
) => {
    const arrRow = item?.ResourcesItemDefIds;
    const balance = dataInfo?.attributes?.qpoint?.data?.attributes?.balance;

    const hasAutoCash = arrRow?.some((item) => "AutoCash" in item);

    const hasQFP = arrRow?.some(el => el?.AutoCashType == "QFP");
    const balanceQ = parseFloat(parseFloat(infoWallet?.balance).toFixed(2));

    if (hasAutoCash) {
        if(hasQFP){
            const result = arrRow?.map((item) => {
                if (item?.AutoCashType === "QFP") {
                    return balance >= item?.CashValue;
                } else {
                    const matchingInventory = arrInventory?.find((el) => el?.ItemDefId === item?.ItemDefId)
                    return matchingInventory?.ItemCount >= item?.Count  ? true : false
                }
            });
            const hasFalseValue = !result.some((value) => value === false);
            return hasFalseValue ? "" : "disable";
        }else{
            const hasFalseValue = balanceQ >= arrRow?.[0]?.CashValue
            return hasFalseValue ? "" : "disable";
        }
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
        stats.Confidence + 
        stats.Shot
    );
    return total;
}

export const renderItemFusion = (
    item: IItemDefFusion, 
    type: "bg" | "count", 
    arrInventory: IItemInventory[], 
    dataInfo: any, 
    infoWallet: IInfoWallet, 
    detail: IFusion
) => {
    const { ItemDefId, AutoCash, CashValue, Count } = item || {};
    const filterIdItem: IItemInventory = arrInventory?.find(
        (el) => el.ItemDefId === ItemDefId
    );
    const dataBalance = dataInfo?.attributes?.qpoint?.data?.attributes;
    const formatBalace = formatNumber(dataBalance?.balance);
    const countItem = filterIdItem?.ItemCount || 0;
    const countHash = Count || 0;
    const hasQFP = detail?.ResourcesItemDefIds?.some(item => item?.AutoCashType == "QFP");
    const hasQ = detail?.ResourcesItemDefIds?.some(item => item?.AutoCashType == "QUAI");
    const balanceQ = Number(infoWallet?.balance).toFixed(2);

    if (type === "count") {
        if (hasQFP) {
            return AutoCash === 1 
                ? `${formatBalace}/${formatNumber(Number(CashValue))}` 
                : `${countItem}/${countHash}`;
        }
        if(hasQ){
            return `${balanceQ}/${CashValue}`;
        }
        return `${countItem}/${Count}`;
    }
    if (type === "bg") {
        const bgRed = "bg-[#FF0000]";
        const bgGreen = "bg-[#2cde00]";

        if (AutoCash === 1) {
            return (hasQFP ? dataBalance?.balance : balanceQ) >= CashValue ? bgGreen : bgRed;
        }
        return countItem >= countHash ? bgGreen : bgRed;
    }
}

export function fnGroupPosition(input) {
    const output = {};

    Object.entries(input)?.forEach(([rarity, items]) => {
        (items as any[])?.forEach(item => {
            const key = `${rarity} - ${item.Code}`;
            if (!output[key]) {
                output[key] = [];
            }
            output[key]?.push(item);
        });
    });

    return output;
}


export function get10Title(data) {
    const result = {};
  
    for (const title in data) {
      if (Array.isArray(data[title])) {
        result[title] = data[title].slice(0, 10);
      }
    }

    return result;
  }