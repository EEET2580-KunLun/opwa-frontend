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
                const item = items.find(i => i.typeKey === type.key);
                const checked = Boolean(item);
                const qty = item?.quantity || 0;

                return (
                    <Box key={type.key} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={checked}
                                    onChange={e => onChange(type.key, e.target.checked ? 1 : 0)}
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
                                value={qty}
                                onChange={e => onChange(type.key, parseInt(e.target.value, 10) || 1)}
                                sx={{ width: 80, mx: 2 }}
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