import React, { useState, useEffect } from 'react';
import {
    Typography,
    IconButton,
    InputAdornment,
    CircularProgress,
    TextField
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useGetTicketTypesQuery, useCreatePurchaseMutation } from '../store/ticketApiSlice';
import TicketTypeSelector from './TicketTypeSelector';
import PaymentSelector from './PaymentSelector';
import PurchaseSummaryDialog from './PurchaseSummaryDialog';
import { useCart } from '../hooks/useCart';
import { usePayment } from '../hooks/usePayment';
import { QrCode } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../store/ticketSlice';
import { generateReceipt } from '../utils/receiptGenerator';
import { validatePassengerId } from '../utils/validationUtils';
import {
    PageContainer,
    SectionTitle,
    TotalCostDisplay,
    ActionButtonsContainer,
    SubmitButton,
    ClearButton
} from '../styles/ticketStyles.js';

export default function PassengerPurchase() {
    const { data: types = [] } = useGetTicketTypesQuery();
    const [createPurchase] = useCreatePurchaseMutation();

    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.auth.user);

    const { items, addItem, removeItem, clearCart: resetCart, totalCost } = useCart();
    const {
        method,
        balance,
        cashReceived,
        change,
        warning,
        isValid: paymentValid,
        setMethod,
        setCash
    } = usePayment(totalCost);

    const [passengerId, setPassengerId] = useState('');
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    // Initialize default ticket
    useEffect(() => {
        if (types.length && !items.length) {
            const t = types[0];
            addItem({ typeKey: t.key, name: t.name, quantity: 1, price: t.price });
        }
    }, [types, items.length, addItem]);

    // Validates passenger ID format
    const idValid = validatePassengerId(passengerId);

    // Only enable confirm if we have items, valid ID, and payment ok
    const canConfirm = items.length > 0 && idValid && paymentValid;

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            const result = await createPurchase({
                purchaserId: passengerId,
                items,
                paymentMethod: method,
                cashReceived
            }).unwrap();

            enqueueSnackbar('Tickets issued successfully!', { variant: 'success' });

            if (result.transactionId) {
                generateReceipt({
                    transactionId: result.transactionId,
                    timestamp: new Date().toISOString(),
                    passengerId,
                    items,
                    total: totalCost,
                    paymentMethod: method,
                    cashReceived,
                    agentId: currentUser?.id || 'AGENT'
                });
            }

            // Reset full form
            resetCart();
            setPassengerId('');
        } catch (error) {
            console.error('Purchase failed:', error);
            enqueueSnackbar(
                error.data?.message || 'Failed to issue tickets. Please try again.',
                { variant: 'error' }
            );
        } finally {
            setIsSubmitting(false);
            setSummaryOpen(false);
        }
    };

    const handleScanQR = async () => {
        setIsLoading(true);
        try {
            // Simulate scan
            const mockId = 'P' + Math.floor(Math.random() * 1e6).toString().padStart(6, '0');
            setPassengerId(mockId);
            // Simulate balance fetch delay
            await new Promise(r => setTimeout(r, 800));
        } catch {
            // ignore
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer>
            <SectionTitle>Ticket Types</SectionTitle>
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

            <TotalCostDisplay>
                Total Cost: {totalCost.toLocaleString()} VND
            </TotalCostDisplay>

            <TextField
                label="Passenger ID"
                value={passengerId}
                onChange={e => setPassengerId(e.target.value)}
                error={passengerId && !idValid}
                helperText={passengerId && !idValid ? 'Invalid Passenger ID' : ''}
                fullWidth
                margin="normal"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={handleScanQR} disabled={isLoading}>
                                {isLoading
                                    ? <CircularProgress size={20} />
                                    : <QrCode size={20} />
                                }
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />

            <PaymentSelector
                method={method}
                onSelect={setMethod}
                balance={balance}
                cashReceived={cashReceived}
                onCashChange={setCash}
                change={change}
                warning={warning}
            />

            <ActionButtonsContainer>
                <ClearButton
                    variant="outlined"
                    onClick={() => {
                        resetCart();
                        setPassengerId('');
                    }}
                >
                    Clear Form
                </ClearButton>
                <SubmitButton
                    variant="contained"
                    color="primary"
                    onClick={() => setSummaryOpen(true)}
                    disabled={!canConfirm || isSubmitting}
                >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Pay Now'}
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