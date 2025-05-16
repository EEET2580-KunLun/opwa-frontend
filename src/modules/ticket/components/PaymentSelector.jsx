import React from 'react';
import {
    FormControlLabel,
    RadioGroup,
    Radio,
    Typography
} from '@mui/material';
import { PAYMENT_METHODS } from '../utils/constants';
import {
    PaymentMethodsContainer,
    PaymentMethodTitle,
    PaymentDetailsContainer,
    CashInputField,
    ChangeDisplay,
    WarningText
} from '../styles/ticketStyles';

export default function PaymentSelector({ method, onSelect, balance, cashReceived = 0, onCashChange, change, warning }) {
    return (
        <PaymentMethodsContainer>
            <PaymentMethodTitle>Payment Methods</PaymentMethodTitle>
            <RadioGroup value={method} onChange={e => onSelect(e.target.value)}>
                <FormControlLabel value={PAYMENT_METHODS.EWALLET} control={<Radio />} label="E-Wallet Payment" />
                <FormControlLabel value={PAYMENT_METHODS.CASH} control={<Radio />} label="Cash Payment" />
            </RadioGroup>
            {method === PAYMENT_METHODS.EWALLET ? (
                <PaymentDetailsContainer>
                    <Typography>Balance: {balance} VND</Typography>
                </PaymentDetailsContainer>
            ) : (
                <PaymentDetailsContainer>
                    <CashInputField
                        size="small"
                        type="number"
                        label="Cash Received"
                        value={cashReceived}
                        onChange={e => onCashChange(Number(e.target.value))}
                    />
                    <ChangeDisplay>Change: {change > 0 ? change : 0} VND</ChangeDisplay>
                </PaymentDetailsContainer>
            )}
            {warning && <WarningText>{warning}</WarningText>}
        </PaymentMethodsContainer>
    );
}