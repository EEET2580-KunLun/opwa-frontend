export function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN').format(value);
}

export function formatDate(ts) {
    return new Date(ts).toLocaleString();
}