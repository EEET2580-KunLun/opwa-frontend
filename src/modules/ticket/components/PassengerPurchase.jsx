import React, { useState, useEffect } from 'react';
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
    Chip,
    Alert
} from '@mui/material';
import { useSnackbar } from 'notistack';
import {
    useGetPawaTicketTypesQuery,
    usePurchaseTicketsForPassengerMutation
} from '../store/pawaTicketApiSlice';
import {
    useGetWalletByIdQuery,
    useGetPassengerByIdQuery
} from '../../passenger/store/pawaPassengerApiSlice';
import TicketTypeSelector from './TicketTypeSelector';
import PaymentSelector from './PaymentSelector';
import PurchaseSummaryDialog from './PurchaseSummaryDialog';
import { useCart } from '../hooks/useCart';
import { usePayment } from '../hooks/usePayment';
import { QrCode, User, Wallet, Search } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../store/ticketSlice';
import { generateReceipt } from '../utils/receiptGenerator';
import { PAYMENT_METHODS } from '../utils/constants';

export default function PassengerPurchase() {
    const location = useLocation();
    const { passengerId: redirectedPassengerId, passengerInfo: initialPassengerInfo } = location.state || {};
    const { data: types = [] } = useGetPawaTicketTypesQuery();
    const [createPurchase] = usePurchaseTicketsForPassengerMutation();
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.auth.user);
    const { enqueueSnackbar } = useSnackbar();
    const { items, addItem, removeItem, totalCost } = useCart();

    const [passengerId, setPassengerId] = useState(redirectedPassengerId || '');
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [walletId, setWalletId] = useState(initialPassengerInfo?.userId || '');
    const [passengerInfo, setPassengerInfo] = useState(initialPassengerInfo || null);
    const [searchTriggered, setSearchTriggered] = useState(false);

    const idValid = redirectedPassengerId || passengerId.trim() !== '';
    // Skip passenger query unless search is triggered
    const {
        data: fetchedPassengerData,
        isFetching: isPassengerFetching,
        isError: isPassengerError,
        error: passengerError
    } = useGetPassengerByIdQuery(passengerId, {
        skip: !searchTriggered || !idValid || !!redirectedPassengerId
    });

    // Skip wallet query if no wallet ID is available
    const {
        data: walletData,
        isLoading: isWalletLoading,
        refetch: refetchWallet
    } = useGetWalletByIdQuery(walletId, {
        skip: !walletId
    });

    const walletBalance = walletData?.balance || 0;

    // Pass wallet balance to usePayment
    const {
        method,
        balance,
        cashReceived,
        change,
        warning,
        isValid: paymentValid,
        setMethod,
        setCash
    } = usePayment(totalCost, walletBalance);

    const hasInsufficientBalance = method === PAYMENT_METHODS.EWALLET && balance < totalCost;

    // Handle successful passenger fetch
    useEffect(() => {
        if (fetchedPassengerData && searchTriggered) {
            setPassengerInfo(fetchedPassengerData);
            setWalletId(fetchedPassengerData.userId || '');
            setSearchTriggered(false);
            enqueueSnackbar('Passenger information loaded successfully', { variant: 'success' });
        }
    }, [fetchedPassengerData, searchTriggered, enqueueSnackbar]);

    // Handle passenger fetch error
    useEffect(() => {
        if (isPassengerError && searchTriggered) {
            enqueueSnackbar(
                passengerError?.data?.message || 'Passenger not found. Please verify the ID.',
                { variant: 'error' }
            );
            setSearchTriggered(false);
        }
    }, [isPassengerError, searchTriggered, passengerError, enqueueSnackbar]);

    // Update walletId when passengerId changes and is valid
    useEffect(() => {
        if (passengerId && idValid && passengerInfo) {
            const userId = passengerInfo?.userId || passengerId;
            setWalletId(userId);
        } else if (!passengerInfo) {
            setWalletId('');
        }
    }, [passengerId, idValid, passengerInfo]);

    const canConfirm = items.length > 0 && idValid && passengerInfo && paymentValid && !hasInsufficientBalance;

    const handleSearchPassenger = () => {
        if (!passengerId || !idValid) {
            enqueueSnackbar('Please enter a valid passenger ID', { variant: 'warning' });
            return;
        }
        setSearchTriggered(true);
    };

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            // If payment method is e-wallet and balance is insufficient, prevent submission
            if (method === PAYMENT_METHODS.EWALLET && balance < totalCost) {
                enqueueSnackbar('Insufficient wallet balance', { variant: 'error' });
                setIsSubmitting(false);
                return;
            }

            const typeKeys = items.map(i => i.typeKey);
            const stationCount = items.map(i => {
                // For ONE_WAY tickets, use the station count or default to 0
                if (i.typeKey === 'ONE_WAY') {
                    return i.stationCount || 0;
                }
                // For other ticket types, station count is 0
                return 0;
            });

            // Add payment method to the request
            const result = await createPurchase({
                type: typeKeys,
                stationCount,
                userId: passengerInfo?.userId || '',
                paymentMethod: method  // Include payment method in the request
            }).unwrap();

            // After successful purchase, refresh wallet balance if e-wallet was used
            if (method === PAYMENT_METHODS.EWALLET && walletId) {
                refetchWallet();
            }

            enqueueSnackbar('Tickets issued successfully!', { variant: 'success' });

            if (result.transactionId) {
                generateReceipt({
                    transactionId: result.transactionId,
                    timestamp: new Date().toISOString(),
                    passengerId,
                    passengerName: passengerInfo ? `${passengerInfo.firstName} ${passengerInfo.lastName}` : 'Customer',
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
                setPassengerInfo(null);
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
        // Simulate QR scan - in a real app, this would trigger camera access
        const mockId = 'P' + Math.floor(Math.random() * 1e6).toString().padStart(6, '0');
        setPassengerId(mockId);
        await new Promise(r => setTimeout(r, 800));
        setIsLoading(false);
        // Automatically trigger search after "scanning"
        setSearchTriggered(true);
    };

    const handleClearForm = () => {
        dispatch(clearCart());
        if (!redirectedPassengerId) {
            setPassengerId('');
            setPassengerInfo(null);
            setWalletId('');
        }
    };

    return (
        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
            {!redirectedPassengerId && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>Find Passenger</Typography>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                            label="Passenger ID"
                            value={passengerId}
                            onChange={e => setPassengerId(e.target.value)}
                            error={passengerId !== '' && !idValid}
                            helperText={passengerId !== '' && !idValid ? 'Invalid Passenger ID' : ''}
                            fullWidth
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleScanQR} disabled={isLoading || isPassengerFetching}>
                                            {isLoading ? <CircularProgress size={20} /> : <QrCode size={20} />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleSearchPassenger}
                            disabled={!idValid || isPassengerFetching}
                            startIcon={isPassengerFetching ? <CircularProgress size={20} /> : <Search size={20} />}
                            sx={{ height: 56, minWidth: 120 }}
                        >
                            {isPassengerFetching ? 'Searching...' : 'Search'}
                        </Button>
                    </Box>
                </Box>
            )}

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

                        {/* Add wallet balance information */}
                        {walletId && (
                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                                <Wallet size={16} style={{ marginRight: 8 }} />
                                <Typography variant="subtitle2">
                                    Wallet Balance:
                                    {isWalletLoading ? (
                                        <CircularProgress size={16} sx={{ ml: 1 }} />
                                    ) : (
                                        <span style={{ fontWeight: 'bold', marginLeft: 8 }}>
                                            {walletBalance.toLocaleString()} VND
                                        </span>
                                    )}
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}

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
                balance={balance}
                cashReceived={cashReceived}
                onCashChange={setCash}
                change={change}
                warning={warning}
                walletLoading={isWalletLoading}
                disableEwallet={!passengerInfo} // Disable e-wallet if no passenger is selected
            />

            {/* Show warning for insufficient balance */}
            {hasInsufficientBalance && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    Insufficient wallet balance. Available: {balance.toLocaleString()} VND,
                    Required: {totalCost.toLocaleString()} VND
                </Alert>
            )}

            {/* Show warning if no passenger selected */}
            {!passengerInfo && items.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                    Please search for a passenger before proceeding with the purchase.
                </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleClearForm}
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
                walletBalance={method === PAYMENT_METHODS.EWALLET ? balance : null}
            />
        </Box>
    );
}