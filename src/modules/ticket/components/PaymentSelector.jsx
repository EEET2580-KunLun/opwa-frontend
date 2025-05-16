import React from 'react';
import {
    ToggleButtonGroup,
    ToggleButton,
    Box,
    Typography,
    TextField
} from '@mui/material';
import { PAYMENT_METHODS } from '../utils/constants';

export default function PaymentSelector({ method, onSelect, balance, cashReceived = 0, onCashChange, change, warning }) {
    return (

        <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Payment Methods
            </Typography>

            {/* pill-shaped toggle */}
            <ToggleButtonGroup
                value={method}
                exclusive
                onChange={(_, val) => val && onSelect(val)}
                sx={{
                    width: '100%',
                    borderRadius: 99,
                    overflow: 'hidden',
                    mb: 2,
                    '& .MuiToggleButton-root': {
                        flex: 1,
                        border: 'none',
                        textTransform: 'none'
                    },
                    '& .Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'common.white'
                    }
                }}
            >
                <ToggleButton value={PAYMENT_METHODS.EWALLET}>
                    E-Wallet Payment
                </ToggleButton>
                <ToggleButton value={PAYMENT_METHODS.CASH}>
                    Cash Payment
                </ToggleButton>
            </ToggleButtonGroup>

            {method === PAYMENT_METHODS.EWALLET ? (
                <Typography>Balance: {balance.toLocaleString()} VND</Typography>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TextField
                        size="small"
                        type="number"
                        label="Cash Received"
                        value={cashReceived}
                        onChange={e => onCashChange(Number(e.target.value))}
                        sx={{ flex: 1 }}
                    />
                    <Typography sx={{ ml: 2 }}>
                        Change: {Math.max(change, 0).toLocaleString()} VND
                    </Typography>
                </Box>
            )}

            {warning && (
                <Typography color="error" sx={{ mt: 1 }}>
                    {warning}
                </Typography>
            )}
        </Box>
    );
}