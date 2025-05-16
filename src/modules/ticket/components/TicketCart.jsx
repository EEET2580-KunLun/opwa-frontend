import React from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ShoppingCart } from 'lucide-react';

const CartContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
}));

const CartHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
}));

const CartIcon = styled(ShoppingCart)(({ theme }) => ({
    marginRight: theme.spacing(1),
}));

const CartBadge = styled('span')(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: '50%',
    padding: '2px 6px',
    fontSize: '0.75rem',
    marginLeft: theme.spacing(1),
}));

const CartTotal = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    marginTop: theme.spacing(1),
}));

export default function TicketCart({ items }) {
    const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalCost = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

    return (
        <CartContainer>
            <CartHeader>
                <CartIcon size={20} />
                <Typography variant="h6">Cart</Typography>
                <CartBadge>{totalCount}</CartBadge>
            </CartHeader>
            <List>
                {items.map(i => (
                    <ListItem key={i.typeKey} disableGutters>
                        <ListItemText
                            primary={`${i.name} x${i.quantity}`}
                            secondary={`${i.quantity * i.price} VND`}
                        />
                    </ListItem>
                ))}
            </List>
            <CartTotal>Total: {totalCost} VND</CartTotal>
        </CartContainer>
    );
}