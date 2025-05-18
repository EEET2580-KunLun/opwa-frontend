import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper
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

export default function TicketList() {
    const { data = [], isLoading } = useGetAllTicketsQuery();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    if (isLoading) return <LoadingWrapper>Loading...</LoadingWrapper>;

    return (
        <ListContainer>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Agent ID</TableCell>
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
                                    <TableCell>{row.agentId}</TableCell>
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
        </ListContainer>
    );
}