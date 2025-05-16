import { createSlice } from '@reduxjs/toolkit';
import { PAYMENT_METHODS } from '../utils/constants';

const initialState = {
    cart: [],      // { typeKey, name, quantity, price }
    payment: {
        method: PAYMENT_METHODS.CASH,
        cashReceived: 0
    },
    ui: { summaryOpen: false }
};

export const ticketSlice = createSlice({
    name: 'ticket',
    initialState,
    reducers: {
        addItem: (state, action) => {
            const { typeKey, name, quantity, price } = action.payload;
            const existingIndex = state.cart.findIndex(item => item.typeKey === typeKey);

            if (existingIndex >= 0) {
                // Update existing item
                state.cart[existingIndex].quantity = quantity;
            } else {
                // Add new item
                state.cart.push({ typeKey, name, quantity, price });
            }
        },
        removeItem: (state, action) => {
            state.cart = state.cart.filter(item => item.typeKey !== action.payload);
        },
        setQuantity: (state, action) => {
            const { key, qty } = action.payload;
            const item = state.cart.find(item => item.typeKey === key);
            if (item) {
                item.quantity = qty;
            }
        },
        clearCart: (state) => {
            state.cart = [];
            state.payment.cashReceived = 0;
        },
        setPaymentMethod: (state, action) => {
            state.payment.method = action.payload;
        },
        setCashReceived: (state, action) => {
            state.payment.cashReceived = action.payload;
        },
        openSummary: (state) => {
            state.ui.summaryOpen = true;
        },
        closeSummary: (state) => {
            state.ui.summaryOpen = false;
        }
    }
});

export const {
    addItem,
    removeItem,
    setQuantity,
    clearCart,
    setPaymentMethod,
    setCashReceived,
    openSummary,
    closeSummary
} = ticketSlice.actions;

export default ticketSlice.reducer;