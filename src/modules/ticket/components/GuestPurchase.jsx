import React, { useState, useEffect } from 'react';
import {
    Typography,
    TextField,
    CircularProgress,
    Box,
    Button
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

    //TODO: Initialize one ticket if empty - it's inconvenient
    useEffect(() => {
        // initialize first type if none selected
        if (types.length && !items.length) {
            addItem({ typeKey: types[0].key, name: types[0].name, quantity: 1, price: types[0].price });
        }
    }, [types, items.length, addItem]);

    // Only allow confirm if:
    // - at least one ticket type selected,
    // - TODO: national ID passes validation,
    // - payment conditions are satisfied (wallet or cash).
    const canConfirm = items.length > 0 && paymentValid;

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
                error.data?.message || 'Failed to issue tickets.',
                { variant: 'error' }
            );
        } finally {
            setIsSubmitting(false);
        }
    };


    return (

        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Ticket Types</Typography>

            <TicketTypeSelector
                types={types}
                items={items}
                onChange={(key, qty) => {
                    const t = types.find(x => x.key === key);
                    if (!t) return;
                    qty > 0
                        ? addItem({ typeKey: key, name: t.name, quantity: qty, price: t.price })
                        : removeItem(key);
                }}
            />

            <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
                Total Cost: {totalCost.toLocaleString()} VND
            </Typography>

            <TextField
                label="National ID"
                value={nationalId}
                onChange={e => setNationalId(e.target.value)}
                fullWidth
                sx={{ mt: 2 }}
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

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                {/* Clear */}
                <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => dispatch(clearCart())}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 99
                    }}
                >
                    Clear Form
                </Button>
                {/* Issue */}
                <Button
                    variant="contained"
                    fullWidth
                    onClick={() => setSummaryOpen(true)}
                    disabled={!canConfirm || isSubmitting}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 99,
                        py: 1.5
                    }}
                >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Issue the Tickets'}
                </Button>
            </Box>

            <PurchaseSummaryDialog
                open={summaryOpen}
                onClose={() => setSummaryOpen(false)}
                items={items}
                total={totalCost}
                warning={warning}
                onConfirm={handleConfirm}
                disableConfirm={!canConfirm}
            />
        </Box>
    );
}