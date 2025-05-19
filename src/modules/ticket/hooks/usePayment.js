import { useSelector, useDispatch } from 'react-redux';
import { setPaymentMethod, setCashReceived } from '../store/ticketSlice';
import { formatCurrency } from '../utils/formatUtils';
import { PAYMENT_METHODS } from '../utils/constants';

export function usePayment(total, walletBalanceFromApi = null) {
    const dispatch = useDispatch();
    const { method, cashReceived } = useSelector(s => s.ticket.payment);
    const balanceFromRedux = useSelector(s => s.auth.balance || 0);
    const change = cashReceived - total;

    // Use wallet balance from API when available for e-wallet method, otherwise fall back to Redux balance
    const effectiveBalance = method === PAYMENT_METHODS.EWALLET && walletBalanceFromApi !== null
        ? walletBalanceFromApi
        : balanceFromRedux;

    // More detailed warning messages
    let warning = null;
    if (method === PAYMENT_METHODS.EWALLET) {
        if (effectiveBalance < total) {
            const diff = total - effectiveBalance;
            warning = `Insufficient funds. Passenger needs to add ${formatCurrency(diff)} VND to complete this purchase.`;
        }
    } else if (method === PAYMENT_METHODS.CASH) {
        if (cashReceived < total) {
            warning = `Cash received is less than the total cost. Need ${formatCurrency(total - cashReceived)} VND more.`;
        }
    }

    return {
        method,
        balance: effectiveBalance,
        cashReceived,
        change,
        warning,
        isValid: method === PAYMENT_METHODS.EWALLET ? effectiveBalance >= total : cashReceived >= total,
        setMethod: m => dispatch(setPaymentMethod(m)),
        setCash: c => dispatch(setCashReceived(c))
    };
}