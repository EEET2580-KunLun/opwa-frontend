import React from 'react';
import {
    ToggleButtonGroup,
    ToggleButton,
    Box,
    Typography,
    TextField,
    InputAdornment,
    CircularProgress
} from '@mui/material';
import { PAYMENT_METHODS } from '../utils/constants';

export default function PaymentSelector({ 
    method, 
    onSelect, 
    balance, 
    cashReceived, 
    onCashChange, 
    change, 
    warning,
    walletLoading = false 
}) {
    // Check if using e-wallet payment
    const isEwalletPayment = method === PAYMENT_METHODS.EWALLET;
    
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

            {isEwalletPayment ? (
                <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        {walletLoading ? (
                            <CircularProgress size={14} sx={{ mr: 1 }} />
                        ) : (
                            <>Wallet Balance: {balance.toLocaleString()} VND</>
                        )}
                    </Typography>
                </Box>
            ) : (
                <Box>
                    <TextField
                        label="Cash Received"
                        type="number"
                        value={cashReceived}
                        onChange={(e) => onCashChange(parseInt(e.target.value) || 0)}
                        fullWidth
                        InputProps={{
                            endAdornment: <InputAdornment position="end">VND</InputAdornment>,
                        }}
                        sx={{ mb: 2 }}
                    />
                    <Typography variant="body2">
                        Change: {change.toLocaleString()} VND
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