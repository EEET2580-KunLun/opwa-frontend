import React, { useState, useEffect } from 'react';
import {
    Typography,
    TextField,
    CircularProgress
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useGetTicketTypesQuery, useCreatePurchaseMutation } from '../store/ticketApiSlice';
import TicketTypeSelector from './TicketTypeSelector';
import PaymentSelector from './PaymentSelector';
import PurchaseSummaryDialog from './PurchaseSummaryDialog';
import { useCart } from '../hooks/useCart';
import { usePayment } from '../hooks/usePayment';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/ticketSlice';

import {
    PageContainer,
    SectionTitle,
    TotalCostDisplay,
    ActionButtonsContainer,
    SubmitButton,
    ClearButton
} from '../styles/ticketStyles';

export default function GuestPurchase() {
    const { data: types = [] } = useGetTicketTypesQuery();
    const [createPurchase] = useCreatePurchaseMutation();
    // const { items, addItem, totalCost } = useCart();
    const { items, addItem, removeItem, totalCost } = useCart();
    const { method, cashReceived, change, warning, setMethod, setCash } = usePayment(totalCost);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [nationalId, setNationalId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useDispatch();
    const { isValid: paymentValid } = usePayment(totalCost);

    useEffect(() => {
        // initialize first type if none selected
        if (types.length && !items.length) {
            addItem({ typeKey: types[0].key, name: types[0].name, quantity: 1, price: types[0].price });
        }
    }, [types, items.length, addItem]);

    // Only allow confirm if:
    // - at least one ticket type selected,
    // - national ID passes validation,
    // - payment conditions are satisfied (wallet or cash).
    const canConfirm =
        items.length > 0 && paymentValid;

    const handleConfirm = async () => {
        try {
            setIsSubmitting(true);
            await createPurchase({
                purchaserId: nationalId,
                items,
                paymentMethod: method,
                cashReceived
            }).unwrap();

            enqueueSnackbar('Tickets issued successfully!', { variant: 'success' });

            // Clear form
            dispatch(clearCart());
            setNationalId('');
            setSummaryOpen(false);
        } catch (error) {
            console.error('Purchase failed:', error);
            enqueueSnackbar(
                error.data?.message || 'Failed to issue tickets. Please try again.',
                { variant: 'error' }
            );
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <PageContainer>
            <SectionTitle variant="h6">Ticket Types</SectionTitle>
            <TicketTypeSelector
                types={types}
                items={items}
                onChange={(typeKey, qty) => {
                    const type = types.find(t => t.key === typeKey);
                    if(!type) return;

                    if(qty > 0) {
                        addItem({
                            typeKey,
                            name: type.name,
                            quantity: qty,
                            price: type.price
                        });
                    }else {
                        removeItem(typeKey);
                    }

                }}
            />

            <TotalCostDisplay variant="h6">Total Cost: {totalCost.toLocaleString()} VND</TotalCostDisplay>
            <TextField
                label="National ID"
                value={nationalId}
                onChange={e => setNationalId(e.target.value)}
                margin="normal"
            />

            <PaymentSelector
                method={method}
                onSelect={setMethod}
                balance={0}
                cashReceived={cashReceived}
                onCashChange={setCash}
                change={change}
                warning={warning}
            />

            <ActionButtonsContainer>
                <ClearButton
                    variant="outlined"
                    onClick={() => dispatch(clearCart())}
                >
                    Clear Form
                </ClearButton>
                <SubmitButton
                    variant="contained"
                    color="primary"
                    onClick={() => setSummaryOpen(true)}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Issue the Tickets'}
                </SubmitButton>
            </ActionButtonsContainer>

            <PurchaseSummaryDialog
                open={summaryOpen}
                onClose={() => setSummaryOpen(false)}
                items={items}
                total={totalCost}
                warning={warning}
                onConfirm={handleConfirm}
                disableConfirm={!canConfirm}
            />
        </PageContainer>
    );
}