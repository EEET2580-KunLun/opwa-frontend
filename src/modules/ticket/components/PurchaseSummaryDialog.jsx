import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    Typography,
    Alert,
    Box,
    Divider
} from '@mui/material';
import { Wallet } from 'lucide-react';

export default function PurchaseSummaryDialog({ 
    open, 
    onClose, 
    items, 
    total, 
    warning, 
    onConfirm, 
    disableConfirm = false,
    passengerInfo = null,
    walletBalance = null
}) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Purchase Summary</Typography>
            </DialogTitle>

            <DialogContent>
                {passengerInfo && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Passenger Information
                        </Typography>
                        <Typography variant="body2">
                            Name: {passengerInfo.firstName} {passengerInfo.middleName || ''} {passengerInfo.lastName}
                        </Typography>
                        <Typography variant="body2">
                            National ID: {passengerInfo.nationalID}
                        </Typography>
                        <Divider sx={{ my: 1.5 }} />
                    </Box>
                )}

                {/* Add wallet balance if payment is by e-wallet */}
                {walletBalance !== null && (
                    <Box sx={{ mt: 1, mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Wallet size={16} style={{ marginRight: 8 }} />
                            E-Wallet Balance: {walletBalance.toLocaleString()} VND
                        </Typography>
                        {walletBalance < total && (
                            <Alert severity="error" sx={{ mt: 1 }}>
                                Insufficient balance for this purchase.
                            </Alert>
                        )}
                    </Box>
                )}
                
                <List disablePadding>
                    {items.map(i => (
                        <ListItem key={i.typeKey} sx={{ py: 1 }}>
                            <ListItemText
                                primary={i.name}
                                secondary={`Qty: ${i.quantity} — Cost: ${(i.quantity * i.price).toLocaleString()} VND`}
                            />
                        </ListItem>
                    ))}
                </List>

                <Typography sx={{ fontWeight: 'bold', mt: 2 }}>
                    Total: {total.toLocaleString()} VND
                </Typography>

                {warning && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {warning}
                    </Alert>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} sx={{ textTransform: 'none' }}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={onConfirm}
                    disabled={disableConfirm}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 99,
                        px: 4
                    }}
                >
                    ISSUE TICKETS
                </Button>
            </DialogActions>
        </Dialog>
    );
}