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
import { styled } from '@mui/material/styles';

const TotalText = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    marginTop: theme.spacing(2),
}));

const WarningAlert = styled(Alert)(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

export default function PurchaseSummaryDialog({ open, onClose, items, total, warning, onConfirm, disableConfirm = false }) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Purchase Summary</DialogTitle>
            <DialogContent>
                <List>
                    {items.map(i => (
                        <ListItem key={i.typeKey}>
                            <ListItemText
                                primary={i.name}
                                secondary={`Qty: ${i.quantity} — Cost: ${i.quantity * i.price} VND`}
                            />
                        </ListItem>
                    ))}
                </List>
                <TotalText><strong>Total:</strong> {total} VND</TotalText>
                {warning && (
                    <WarningAlert severity="error">{warning}</WarningAlert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={onConfirm}
                    disabled={disableConfirm}
                >ISSUE TICKETS</Button>
            </DialogActions>
        </Dialog>
    );
}