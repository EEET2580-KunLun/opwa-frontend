import { useSelector, useDispatch } from 'react-redux';
import { addItem, removeItem, setQuantity, clearCart } from '../store/ticketSlice';
import { useEffect } from 'react';

export function useCart() {
    const dispatch = useDispatch();
    const items = useSelector(state => state.ticket.cart);
    const totalCost = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

    // Load from localStorage on hook initialization
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('ticketCart');
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                parsedCart.forEach(item => dispatch(addItem(item)));
            }
        } catch (e) {
            console.error('Failed to load cart:', e);
        }
    }, [dispatch]);

    // Save to localStorage when cart changes
    useEffect(() => {
        localStorage.setItem('ticketCart', JSON.stringify(items));
    }, [items]);

    return {
        items,
        addItem: (item) => dispatch(addItem(item)),
        removeItem: key => dispatch(removeItem(key)),
        setQuantity: ({key, qty}) => dispatch(setQuantity({key, qty})),
        clearCart: () => dispatch(clearCart()),
        totalCost,
        totalItems: items.reduce((sum, i) => sum + i.quantity, 0)
    };
}