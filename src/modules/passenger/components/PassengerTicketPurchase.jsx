import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Typography,
    IconButton,
    InputAdornment,
    CircularProgress,
    TextField,
    Box,
    Button,
    Card,
    CardContent,
    Chip
} from '@mui/material';
import { useSnackbar } from 'notistack';
import {
    useGetPawaTicketTypesQuery,
    usePurchaseTicketsForPassengerMutation
} from '../../ticket/store/pawaTicketApiSlice';
import TicketTypeSelector from '../../ticket/components/TicketTypeSelector';
import PaymentSelector from '../../ticket/components/PaymentSelector';
import PurchaseSummaryDialog from '../../ticket/components/PurchaseSummaryDialog';
import { useCart } from '../../ticket/hooks/useCart';
import { usePayment } from '../../ticket/hooks/usePayment';
import { QrCode, User } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../../ticket/store/ticketSlice';
import { generateReceipt } from '../../ticket/utils/receiptGenerator';
import { validatePassengerId } from '../../ticket/utils/validationUtils';

export default function PassengerTicketPurchase() {
    const location = useLocation();
    const { passengerId: redirectedPassengerId, passengerInfo } = location.state || {};
    const { data: types = [] } = useGetPawaTicketTypesQuery();
    const [createPurchase] = usePurchaseTicketsForPassengerMutation();
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.auth.user);
    const { enqueueSnackbar } = useSnackbar();
    const { items, addItem, removeItem, totalCost } = useCart();
    const { method, balance, cashReceived, change, warning, isValid: paymentValid, setMethod, setCash } = usePayment(totalCost);
    const [passengerId, setPassengerId] = useState(redirectedPassengerId || '');
    const [email, setEmail] = useState(passengerInfo?.email || '');
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const idValid = redirectedPassengerId || validatePassengerId(passengerId);
    const canConfirm = items.length > 0 && idValid && paymentValid;

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            const typeKeys = items.map(i => i.typeKey);
            const stationCount = items.map(i => i.typeKey.includes('ONE_WAY') ? (i.stationCount || 0) : 0);
            const result = await createPurchase({
                type: typeKeys,
                stationCount,
                userId: passengerInfo?.userId || '',
                email
            }).unwrap();
            enqueueSnackbar('Tickets issued successfully!', { variant: 'success' });
            if (result.transactionId) {
                generateReceipt({
                    transactionId: result.transactionId,
                    timestamp: new Date().toISOString(),
                    passengerId,
                    passengerName: passengerInfo ? `${passengerInfo.firstName} ${passengerInfo.lastName}` : 'Customer',
                    email,
                    items,
                    total: totalCost,
                    paymentMethod: method,
                    cashReceived,
                    agentId: currentUser?.id || 'AGENT'
                });
            }
            dispatch(clearCart());
            if (!redirectedPassengerId) {
                setPassengerId('');
                setEmail('');
            }
            setSummaryOpen(false);
        } catch (error) {
            console.error(error);
            enqueueSnackbar(error.data?.message || 'Failed to issue tickets. Please try again.', { variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleScanQR = async () => {
        setIsLoading(true);
        const mockId = 'P' + Math.floor(Math.random() * 1e6).toString().padStart(6, '0');
        setPassengerId(mockId);
        await new Promise(r => setTimeout(r, 800));
        setIsLoading(false);
    };

    return (
        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
            {passengerInfo && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <User size={20} style={{ marginRight: 8 }} />
                            <Typography variant="h6">Passenger Information</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ minWidth: 200 }}>
                                <Typography variant="body2" color="text.secondary">Name</Typography>
                                <Typography variant="body1">{passengerInfo.firstName} {passengerInfo.middleName} {passengerInfo.lastName}</Typography>
                            </Box>
                            <Box sx={{ minWidth: 150 }}>
                                <Typography variant="body2" color="text.secondary">National ID</Typography>
                                <Typography variant="body1">{passengerInfo.nationalID}</Typography>
                            </Box>
                            <Box sx={{ minWidth: 150 }}>
                                <Typography variant="body2" color="text.secondary">Phone</Typography>
                                <Typography variant="body1">{passengerInfo.phoneNumber}</Typography>
                            </Box>
                            <Box sx={{ minWidth: 150 }}>
                                <Typography variant="body2" color="text.secondary">Special Status</Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    {passengerInfo.isStudent && <Chip label="Student" size="small" color="primary" sx={{ mr: 0.5 }} />}
                                    {passengerInfo.isDisability && <Chip label="Disability" size="small" color="info" sx={{ mr: 0.5 }} />}
                                    {passengerInfo.isRevolutionaryContribution && <Chip label="Revolutionary" size="small" color="success" />}
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}

            <Typography variant="h6" gutterBottom>Ticket Types</Typography>

            <TicketTypeSelector
                types={types}
                items={items}
                onChange={(key, qty) => {
                    const t = types.find(x => x.key === key);
                    if (!t) return;
                    if (qty > 0) addItem({ typeKey: key, name: t.name, quantity: qty, price: t.price });
                    else removeItem(key);
                }}
            />

            <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
                Total Cost: {totalCost.toLocaleString()} VND
            </Typography>

            {!redirectedPassengerId && (
                <TextField
                    label="Passenger ID"
                    value={passengerId}
                    onChange={e => setPassengerId(e.target.value)}
                    error={passengerId !== '' && !idValid}
                    helperText={passengerId !== '' && !idValid ? 'Invalid Passenger ID' : ''}
                    fullWidth
                    sx={{ mt: 2 }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleScanQR} disabled={isLoading}>
                                    {isLoading ? <CircularProgress size={20} /> : <QrCode size={20} />}
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
            )}

            <TextField
                label="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                sx={{ mt: 2 }}
                type="email"
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

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                        dispatch(clearCart());
                        if (!redirectedPassengerId) {
                            setPassengerId('');
                            setEmail('');
                        }
                    }}
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
                    {isSubmitting ? <CircularProgress size={24} /> : 'Pay Now'}
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
                passengerInfo={passengerInfo}
            />
        </Box>
    );
}
