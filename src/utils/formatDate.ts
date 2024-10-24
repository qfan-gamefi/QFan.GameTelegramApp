import dayjs from "dayjs";

export const formatDateToDDMMMYY = (date: Date | null | undefined) => {
    if (!date) {
        return "";
    }
    return dayjs(date).format("DD-MMM-YY");
};

export const formatDateTimeUS = (date: Date | null | undefined) => {
    if (!date) {
        return "";
    }
    return dayjs(date).format("YY-MM-DD HH:mm");
};

export const formatDateDDMMYYYY = (date: Date | null | undefined) => {
    if (!date) {
        return "";
    }
    return dayjs(date).format("DD-MM-YYYY");
};

export const formatTime = (date: Date | null | undefined) => {
    if (!date) {
        return "";
    }
    return dayjs(date).format("HH:mm");
};
