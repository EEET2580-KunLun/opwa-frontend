import { useSelector, useDispatch } from 'react-redux';
import { setPaymentMethod, setCashReceived } from '../store/ticketSlice';
import { formatCurrency } from '../utils/formatUtils';
import { PAYMENT_METHODS } from '../utils/constants';

export function usePayment(total) {
    const dispatch = useDispatch();
    const { method, cashReceived } = useSelector(s => s.ticket.payment);
    const balance = useSelector(s => s.auth.balance || 0);
    const change = cashReceived - total;

    // More detailed warning messages
    let warning = null;
    if (method === PAYMENT_METHODS.EWALLET) {
        if (balance < total) {
            const diff = total - balance;
            warning = `Insufficient funds. Passenger needs to add ${formatCurrency(diff)} VND to complete this purchase.`;
        }
    } else if (method === PAYMENT_METHODS.CASH) {
        if (cashReceived < total) {
            warning = `Cash received is less than the total cost. Need ${formatCurrency(total - cashReceived)} VND more.`;
        }
    }

    return {
        method,
        balance,
        cashReceived,
        change,
        warning,
        isValid: method === PAYMENT_METHODS.EWALLET ? balance >= total : cashReceived >= total,
        setMethod: m => dispatch(setPaymentMethod(m)),
        setCash: c => dispatch(setCashReceived(c))
    };
}