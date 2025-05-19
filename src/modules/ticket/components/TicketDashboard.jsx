import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import GuestPurchase from './GuestPurchase';
import PassengerManagement from "../../passenger/components/PassengerManagement.jsx";
import PassengerPurchase from "./PassengerPurchase.jsx";


export default function TicketDashboard() {
    const [tab, setTab] = useState(0);

    return (

        <Box sx={{ width: '100%' }}>
            <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                    mb: 3,
                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
                    '& .MuiTabs-indicator': {
                        height: 3,
                        borderRadius: 3,
                        bgcolor: 'primary.main'
                    }
                }}
            >
                <Tab label="For guests" />
                <Tab label="For passengers" />
            </Tabs>

            {tab === 0 && <GuestPurchase />}
            {tab === 1 && <PassengerPurchase />}
        </Box>
    );
}