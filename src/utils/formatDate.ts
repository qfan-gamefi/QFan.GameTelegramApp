import dayjs from "dayjs";

export const formatDateToDDMMMYY = (date: Date | null | undefined) => {
    if (!date) {
        return "";
    }
    return dayjs(date).format("DD-MMM-YY");
};
