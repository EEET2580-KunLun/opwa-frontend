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
    Alert
} from '@mui/material';

export default function PurchaseSummaryDialog({ open, onClose, items, total, warning, onConfirm, disableConfirm = false }) {
    return (

        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Purchase Summary</Typography>
            </DialogTitle>

            <DialogContent>
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