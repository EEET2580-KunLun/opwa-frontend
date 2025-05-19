import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Tabs,
    Tab,
    Box
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useGetPurchaseHistoryQuery } from '../store/ticketApiSlice';
import { formatDate } from '../utils/formatUtils';
import GuestPurchase from './GuestPurchase';

const HistoryContainer = styled(Paper)(({ theme }) => ({
    margin: theme.spacing(2),
    overflow: 'hidden',
}));

const LoadingWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(4),
    textAlign: 'center',
}));

export default function TicketHistory() {
    const { data = [], isLoading } = useGetPurchaseHistoryQuery();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (isLoading && activeTab === 0) return <LoadingWrapper>Loading...</LoadingWrapper>;

    return (
        <Box>
            <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                sx={{ 
                    mb: 3, 
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Tab label="Purchase History" />
                <Tab label="Guest Purchase" />
            </Tabs>

            {activeTab === 0 && (
                <HistoryContainer>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Ticket Type</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Payment</TableCell>
                                    <TableCell>Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map(row => (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.typeName}</TableCell>
                                            <TableCell>{row.quantity}</TableCell>
                                            <TableCell>{row.paymentMethod}</TableCell>
                                            <TableCell>{formatDate(row.timestamp)}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={data.length}
                        page={page}
                        onPageChange={(_, p) => setPage(p)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={e => {
                            setRowsPerPage(+e.target.value);
                            setPage(0);
                        }}
                    />
                </HistoryContainer>
            )}

            {activeTab === 1 && (
                <GuestPurchase />
            )}
        </Box>
    );
}