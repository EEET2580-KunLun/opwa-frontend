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
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const {
        items,
        addItem,
        removeItem,
        totalCost,
        clearCart: resetCart
    } = useCart();

    const {
        method,
        cashReceived,
        change,
        warning,
        setMethod,
        setCash,
        isValid: paymentValid
    } = usePayment(totalCost);

    const [summaryOpen, setSummaryOpen] = useState(false);
    const [nationalId, setNationalId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Clear cart only once on mount
    useEffect(() => {
        resetCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const canConfirm = items.length > 0 && paymentValid;

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            await createPurchase({
                purchaserId: nationalId,
                items,
                paymentMethod: method,
                cashReceived
            }).unwrap();

            enqueueSnackbar('Tickets issued successfully!', { variant: 'success' });
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
            <Typography variant="h6" gutterBottom>
                Ticket Types
            </Typography>

            <TicketTypeSelector
                types={types}
                items={items}
                onChange={(key, qty) => {
                    const t = types.find(x => x.key === key);
                    if (!t) return;
                    if (qty > 0) {
                        addItem({ typeKey: key, name: t.name, quantity: qty, price: t.price });
                    } else {
                        removeItem(key);
                    }
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
                <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => dispatch(clearCart())}
                    sx={{ textTransform: 'none', borderRadius: 99 }}
                >
                    Clear Form
                </Button>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={() => setSummaryOpen(true)}
                    disabled={!canConfirm || isSubmitting}
                    sx={{ textTransform: 'none', borderRadius: 99, py: 1.5 }}
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
