import React from 'react';
import {
    FormGroup,
    FormControlLabel,
    Checkbox,
    TextField,
    Typography,
    Box
} from '@mui/material';

export default function TicketTypeSelector({ types, items, onChange }) {
    return (
        <FormGroup>
            {types.map(type => {
                // find if this type is in the cart
                const item = items.find(i => i.typeKey === type.key);
                const checked = Boolean(item);
                const quantity = item ? item.quantity : 0;

                return (
                    <Box
                        key={type.key}
                        display="flex"
                        alignItems="center"
                        mb={1}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={checked}
                                    onChange={e => {
                                        // if toggled on, default qty=1; if off, qty=0 (remove)
                                        onChange(type.key, e.target.checked ? 1 : 0);
                                    }}
                                />
                            }
                            label={type.name}
                        />

                        {checked && (
                            <TextField
                                size="small"
                                type="number"
                                label="Qty"
                                inputProps={{ min: 1 }}
                                value={quantity}
                                onChange={e => {
                                    const q = parseInt(e.target.value, 10) || 1;
                                    onChange(type.key, q);
                                }}
                                sx={{ width: 100, mx: 2 }}
                            />
                        )}

                        <Typography sx={{ ml: 'auto' }}>
                            Cost: {type.price.toLocaleString()} VND
                        </Typography>
                    </Box>
                );
            })}
        </FormGroup>
    );
}