import React, { useState } from 'react';
import { Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import GuestPurchase from './GuestPurchase';
import PassengerPurchase from './PassengerPurchase';

const DashboardContainer = styled('div')(({ theme }) => ({
    width: '100%',
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

export default function TicketDashboard() {
    const [tab, setTab] = useState(0);

    return (
        <DashboardContainer>
            <StyledTabs value={tab} onChange={(_, v) => setTab(v)}>
                <Tab label="For guests" />
                <Tab label="For passengers" />
            </StyledTabs>
            {tab === 0 && <GuestPurchase />}
            {tab === 1 && <PassengerPurchase />}
        </DashboardContainer>
    );
}