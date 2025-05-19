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
    Chip,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Box,
    Button,
    Tabs,
    Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useGetAllTicketsQuery } from '../store/pawaTicketApiSlice';
import { formatDate } from '../utils/formatUtils';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import TicketDashboard from './TicketDashboard';

const ListContainer = styled(Paper)(({ theme }) => ({
    margin: theme.spacing(2),
    overflow: 'hidden',
}));

const LoadingWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(4),
    textAlign: 'center',
}));

// Status color mapping
const getStatusColor = (status) => {
    switch(status) {
        case 'ACTIVE': return 'success';
        case 'INACTIVE': return 'default';
        case 'EXPIRED': return 'error';
        default: return 'default';
    }
};

export default function TicketList() {
    const { data = [], isLoading } = useGetAllTicketsQuery();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [activeTab, setActiveTab] = useState(0);

    // Filter states
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState(null);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleClearDate = () => {
        setDateFilter(null);
        setPage(0);
    };

    // Only show loading for the ticket list tab
    if (isLoading && activeTab === 0) return <LoadingWrapper>Loading tickets...</LoadingWrapper>;

    // Filter data for ticket list
    const filteredData = data.filter(ticket => {
        // Type filter
        if (typeFilter !== 'ALL' && ticket.type !== typeFilter) {
            return false;
        }

        // Status filter
        if (statusFilter !== 'ALL' && ticket.status !== statusFilter) {
            return false;
        }

        // Date filter
        if (dateFilter) {
            const ticketDate = new Date(ticket.purchaseTime);
            const filterDate = new Date(dateFilter);

            if (
                ticketDate.getDate() !== filterDate.getDate() ||
                ticketDate.getMonth() !== filterDate.getMonth() ||
                ticketDate.getFullYear() !== filterDate.getFullYear()
            ) {
                return false;
            }
        }

        return true;
    });

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
                <Tab label="Ticket List" />
                <Tab label="Purchase Dashboard" />
            </Tabs>

            {activeTab === 0 && (
                <ListContainer>
                    <Box sx={{ p: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={4} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Ticket Type</InputLabel>
                                    <Select
                                        value={typeFilter}
                                        label="Ticket Type"
                                        onChange={(e) => {
                                            setTypeFilter(e.target.value);
                                            setPage(0);
                                        }}
                                    >
                                        <MenuItem value="ALL">All Types</MenuItem>
                                        <MenuItem value="ONE_WAY">ONE_WAY</MenuItem>
                                        <MenuItem value="FREE">FREE</MenuItem>
                                        <MenuItem value="DAILY">DAILY</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={4} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={statusFilter}
                                        label="Status"
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            setPage(0);
                                        }}
                                    >
                                        <MenuItem value="ALL">All Statuses</MenuItem>
                                        <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                                        <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                                        <MenuItem value="EXPIRED">EXPIRED</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={4} md={4}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DatePicker
                                            label="Purchase Date"
                                            value={dateFilter}
                                            onChange={(newDate) => {
                                                setDateFilter(newDate);
                                                setPage(0);
                                            }}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: "small"
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>
                                    {dateFilter && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={handleClearDate}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>

                    {!data.length ? (
                        <Typography variant="h6" align="center" sx={{ p: 4 }}>
                            No tickets found
                        </Typography>
                    ) : (
                        <>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Ticket ID</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Station Count</TableCell>
                                            <TableCell>Purchase Time</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Price</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredData
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map(ticket => (
                                                <TableRow key={ticket.id}>
                                                    <TableCell>{ticket.id}</TableCell>
                                                    <TableCell>{ticket.type}</TableCell>
                                                    <TableCell>
                                                        {ticket.stationCount !== null ? ticket.stationCount : 'N/A'}
                                                    </TableCell>
                                                    <TableCell>{formatDate(ticket.purchaseTime)}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={ticket.status}
                                                            color={getStatusColor(ticket.status)}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Intl.NumberFormat('vi-VN', {
                                                            style: 'currency',
                                                            currency: 'VND'
                                                        }).format(ticket.price)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                component="div"
                                count={filteredData.length}
                                page={page}
                                onPageChange={(_, p) => setPage(p)}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={e => {
                                    setRowsPerPage(+e.target.value);
                                    setPage(0);
                                }}
                            />
                        </>
                    )}
                </ListContainer>
            )}

            {activeTab === 1 && (
                <TicketDashboard />
            )}
        </Box>
    );
}