export const formattedBalance = (value: string | number) => {
    const result = Number(value) || 0;
    return (
        new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(result) || 0
    );
};
