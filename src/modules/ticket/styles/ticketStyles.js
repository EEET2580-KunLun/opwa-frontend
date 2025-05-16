import { styled } from '@mui/material/styles';
import {
    Box,
    Typography,
    Paper,
    Button,
    IconButton,
    TextField
} from '@mui/material';

// General components
export const PageContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

export const ContentPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
}));

export const FormContainer = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

// Ticket specific components
export const TicketTypesContainer = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

export const TotalCostDisplay = styled(Typography)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    fontWeight: 'bold',
}));

export const ActionButtonsContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
}));

export const ScanButton = styled(IconButton)(({ theme }) => ({
    marginLeft: theme.spacing(1),
}));

export const PaymentMethodsContainer = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

export const PaymentMethodTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
}));

export const PaymentDetailsContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
}));

export const ChangeDisplay = styled(Typography)(({ theme }) => ({
    marginLeft: theme.spacing(2),
}));

export const WarningText = styled(Typography)(({ theme }) => ({
    color: theme.palette.error.main,
    marginTop: theme.spacing(1),
}));

export const CashInputField = styled(TextField)(({ theme }) => ({
    width: '60%',
    marginRight: theme.spacing(2),
}));

export const PayButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

export const ClearButton = styled(Button)({
    // Add any specific styling for the clear button
});

export const SubmitButton = styled(Button)({
    // Add any specific styling for the submit button
});