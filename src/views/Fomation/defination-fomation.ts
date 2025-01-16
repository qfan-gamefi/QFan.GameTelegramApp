import { IDetailPlayer } from "@/interface";
import { renderConfiguration } from "../Inventory/inventoryHelpers";

export const getPlateImage = (item) => {
    try {
        const imageUrl = JSON.parse(item?.ItemDef?.ImageUrl);
        return imageUrl?.Plate || "/assets/fomation/add_player.png";
    } catch (e) {
        return "/assets/fomation/add_player.png";
    }
};

export const getPlayerImage = (item) => {
    try {
        const imageUrl = JSON.parse(item?.ItemDef?.ImageUrl);
        return imageUrl?.Player || "/assets/fomation/add_player.png";
    } catch (e) {
        return "/assets/fomation/add_player.png";
    }
};

export const processPlayerDetails = (item: IDetailPlayer) => {
    const allowedStats = [
        "Tackle",
        "Stamina",
        "Dribbling",
        "Confidence",
        "Speed",
        "Shot",
    ];
    const itemClone = { ...item };

    try {
        const configurationData = itemClone.Configuration
            ? JSON.parse(itemClone.Configuration)
            : {};

        const playerStats = configurationData.PlayerStat || {};

        const configurationArray = Object.entries(playerStats).map(
            ([key, value]) => ({
                Configuration: key,
                value,
            })
        );

        itemClone.ConfigurationArr = configurationArray.filter((config) =>
            allowedStats.includes(config.Configuration)
        );
    } catch (error) {
        itemClone.ConfigurationArr = [];
    }

    return itemClone;
};

export const countNameDefaultInStack = (dataPlayer: IDetailPlayer[]) => {
    const parseConfiPlayer = dataPlayer?.map((item) => {
        return {
            ...item,
            Configuration: renderConfiguration(item?.Configuration),
            ConfigurationText: item?.Configuration,
        };
    });

    const countDefaultInStack = parseConfiPlayer?.reduce((acc, item) => {
        if (!acc[item.ItemDefId]) {
            acc[item.ItemDefId] = { ...item, ItemCount: 0 };
        }

        if (item.DefaultInStack) {
            acc[item.ItemDefId] = {
                ...item,
                ItemCount: acc[item.ItemDefId].ItemCount + item.ItemCount,
            };
        } else {
            if (item.Configuration > acc[item.ItemDefId].Configuration) {
                acc[item.ItemDefId] = {
                    ...item,
                    ItemCount: acc[item.ItemDefId].ItemCount + item.ItemCount,
                };
            } else {
                acc[item.ItemDefId].ItemCount += item.ItemCount;
            }
        }

        return acc;
    }, {});

    const result = countDefaultInStack && Object.values(countDefaultInStack);
    return result;
};

export const groupedPlayer = (dataCountName) => {
    return dataCountName?.reduce(
        (acc, item: IDetailPlayer) => {
            const category = item?.ItemDef?.Grade;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        },
        {}
    );
} 

const sortedKeys = ["Iconic", "Legendary", "Epic", "Rare", "Common"];
export const sortedGroupPlayer = (dataPlayer) => {
    return (
        dataPlayer &&
        Object.keys(dataPlayer)
            .filter((key) => sortedKeys.includes(key))
            .sort(
                (key1, key2) =>
                    sortedKeys.indexOf(key1) - sortedKeys.indexOf(key2)
            )
            .reduce((acc, key) => {
                acc[key] = dataPlayer[key];
                return acc;
            }, {})
    );
};
