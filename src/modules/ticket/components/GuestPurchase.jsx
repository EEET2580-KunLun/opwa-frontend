import React, { useState } from 'react';
import {
    Typography,
    CircularProgress,
    Box,
    Button,
    Alert
} from '@mui/material';
import { useSnackbar } from 'notistack';
import {
    useGetPawaTicketTypesQuery,
    usePurchaseTicketsForGuestMutation
} from '../store/pawaTicketApiSlice';
import TicketTypeSelector from './TicketTypeSelector';
import PaymentSelector from './PaymentSelector';
import PurchaseSummaryDialog from './PurchaseSummaryDialog';
import { useCart } from '../hooks/useCart';
import { usePayment } from '../hooks/usePayment';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../store/ticketSlice';
import { generateReceipt } from '../utils/receiptGenerator';
import { PAYMENT_METHODS } from '../utils/constants';

export default function GuestPurchase() {
    const { data: types = [] } = useGetPawaTicketTypesQuery();
    const [createPurchase] = usePurchaseTicketsForGuestMutation();
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const currentUser = useSelector(state => state.auth.user);
    
    const { items, addItem, removeItem, totalCost } = useCart();
    
    // Use the same payment functionality as passenger purchase
    const { 
        method, 
        cashReceived, 
        change, 
        warning,
        isValid: paymentValid, 
        setMethod, 
        setCash 
    } = usePayment(totalCost);
    
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const canConfirm = items.length > 0 && paymentValid;
    
    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            // Extract type keys and station counts correctly
            const typeKeys = items.map(i => i.typeKey);
            const stationCount = items.map(i => {
                // For ONE_WAY tickets, use the station count or default to 0
                if (i.typeKey === 'ONE_WAY') {
                    return i.stationCount || 0;
                }
                // For other ticket types, station count is 0
                return 0;
            });
            
            // Use the current agent's ID since this is a guest purchase
            const result = await createPurchase({
                type: typeKeys,
                stationCount,
                userId: currentUser?.id || 'AGENT' // Use agent ID for guest purchases
            }).unwrap();
            
            enqueueSnackbar('Guest tickets issued successfully!', { variant: 'success' });
            
            if (result.transactionId) {
                generateReceipt({
                    transactionId: result.transactionId,
                    timestamp: new Date().toISOString(),
                    passengerId: result.guestId || 'GUEST',
                    passengerName: 'Guest Customer',
                    items,
                    total: totalCost,
                    paymentMethod: method,
                    cashReceived,
                    agentId: currentUser?.id || 'AGENT'
                });
            }
            
            dispatch(clearCart());
            setSummaryOpen(false);
        } catch (error) {
            console.error(error);
            enqueueSnackbar(error.data?.message || 'Failed to issue tickets. Please try again.', { variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Guest Ticket Purchase</Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
                These tickets are for walk-in guests and do not require a passenger account.
            </Alert>
            
            <Typography variant="h6" gutterBottom>Ticket Types</Typography>

            <TicketTypeSelector
                types={types}
                items={items}
                onChange={(key, qty, options = {}) => {
                    if (qty > 0) {
                        // Find base ticket type by matching the key prefix
                        const baseType = types.find(t => t.key.startsWith(key));
                        if (!baseType) {
                            console.error(`Could not find ticket type for key: ${key}`);
                            return;
                        }
                        
                        let name = baseType.name;
                        let price = baseType.price;
                        let stationCount;
                        
                        // For ONE_WAY, use the provided options
                        if (key === 'ONE_WAY' && options) {
                            name = options.name || baseType.name;
                            price = options.price || baseType.price;
                            stationCount = options.stationCount;
                        }
                        
                        addItem({ 
                            typeKey: key, 
                            name, 
                            quantity: qty, 
                            price,
                            stationCount 
                        });
                    } else {
                        removeItem(key);
                    }
                }}
            />

            <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
                Total Cost: {totalCost.toLocaleString()} VND
            </Typography>

            <PaymentSelector
                method={method}
                onSelect={setMethod}
                cashReceived={cashReceived}
                onCashChange={setCash}
                change={change}
                warning={warning}
                disableEwallet={true} // Disable e-wallet for guests since they don't have an account
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
                    {isSubmitting ? <CircularProgress size={24} /> : 'Issue Guest Tickets'}
                </Button>
            </Box>

            <PurchaseSummaryDialog
                open={summaryOpen}
                onClose={() => setSummaryOpen(false)}
                items={items}
                total={totalCost}
                warning={warning}
                onConfirm={handleConfirm}
                disableConfirm={!canConfirm || isSubmitting}
                guestPurchase={true}
            />
        </Box>
    );
}