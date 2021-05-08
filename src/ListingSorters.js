
export const getListingSorterById = (sortId) => {
    switch (sortId) {
        case 1:
            return (a, b) => a.sellerNickname.localeCompare(b.sellerNickname);
        case 2:
            return (a, b) => (a.amount - b.amount);
        case 3:
            return (a, b) => (a.unitPrice - b.unitPrice);
        case 4:
            return (a, b) => (a.unitPrice * a.amount - b.unitPrice * b.amount);
        default:
            return null;
    }
};