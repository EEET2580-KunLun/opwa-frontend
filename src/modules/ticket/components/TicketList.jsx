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
    Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useGetAllTicketsQuery } from '../store/pawaTicketApiSlice';
import { formatDate } from '../utils/formatUtils';

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

    if (isLoading) return <LoadingWrapper>Loading tickets...</LoadingWrapper>;

    // Handle empty data case
    if (!data.length) {
        return (
            <ListContainer>
                <Typography variant="h6" align="center" sx={{ p: 4 }}>
                    No tickets found
                </Typography>
            </ListContainer>
        );
    }

    return (
        <ListContainer>
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
                        {data
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
                count={data.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={e => {
                    setRowsPerPage(+e.target.value);
                    setPage(0);
                }}
            />
        </ListContainer>
    );
}