import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    CircularProgress,
    Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
    Chart as ChartJS, 
    ArcElement, 
    Tooltip as ChartTooltip, 
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Import only the internal analytics endpoint
import { useGetTicketAnalyticsQuery } from '../store/statisticsApiSlice.js';

// Register ChartJS components
ChartJS.register(
    ArcElement, 
    ChartTooltip, 
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: theme.shadows[3],
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[6],
    },
}));

const CardHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    paddingBottom: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const ChartContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    height: 300,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
}));

// Color palettes for the charts
const typeColors = [
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 99, 132, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
];

const statusColors = [
    'rgba(40, 167, 69, 0.8)',    // Green for ACTIVE
    'rgba(220, 53, 69, 0.8)',    // Red for EXPIRED
    'rgba(108, 117, 125, 0.8)',  // Gray for INACTIVE
    'rgba(255, 193, 7, 0.8)',    // Yellow for any other status
];

// Status badge colors
const getStatusColor = (status) => {
    switch (status.toUpperCase()) {
        case 'ACTIVE': return 'success';
        case 'EXPIRED': return 'error';
        case 'INACTIVE': return 'default';
        default: return 'warning';
    }
};

export default function TicketAnalytics() {
    // Query internal analytics
    const { 
        data: analytics, 
        isLoading, 
        error 
    } = useGetTicketAnalyticsQuery();

    // Chart data preparation
    const typeChartData = {
        labels: analytics?.ticket_type_counts?.map(item => item.ticket_type) || [],
        datasets: [
            {
                data: analytics?.ticket_type_counts?.map(item => item.count) || [],
                backgroundColor: typeColors,
                borderColor: typeColors.map(color => color.replace('0.8', '1')),
                borderWidth: 1,
            },
        ],
    };

    const statusChartData = {
        labels: analytics?.ticket_status_counts?.map(item => item.ticket_status) || [],
        datasets: [
            {
                data: analytics?.ticket_status_counts?.map(item => item.count) || [],
                backgroundColor: statusColors,
                borderColor: statusColors.map(color => color.replace('0.8', '1')),
                borderWidth: 1,
            },
        ],
    };

    // Chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    boxWidth: 15,
                    padding: 15,
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };

    // Table data calculation
    const typeDetails = analytics?.ticket_type_counts?.map(item => ({
        type: item.ticket_type,
        count: item.count,
        percentage: analytics.total_tickets > 0 
            ? ((item.count / analytics.total_tickets) * 100).toFixed(1) 
            : 0
    })) || [];
    
    const statusDetails = analytics?.ticket_status_counts?.map(item => ({
        status: item.ticket_status,
        count: item.count,
        percentage: analytics.total_tickets > 0 
            ? ((item.count / analytics.total_tickets) * 100).toFixed(1) 
            : 0
    })) || [];

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
                <Typography variant="h6" ml={2}>
                    Loading ticket analytics...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box m={3}>
                <Alert severity="error">
                    Error loading ticket analytics: {error.message || 'Unknown error'}
                </Alert>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Box mb={3}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Ticket Analytics
                </Typography>
            </Box>

            {/* Overview Card */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Overview
                    </Typography>
                    <Typography variant="h3" color="primary">
                        {analytics?.total_tickets || 0}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        Total Tickets Sold
                    </Typography>
                </CardContent>
            </Card>

            {/* Charts Section */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={6}>
                    <StyledCard>
                        <CardHeader>
                            <Typography variant="h6">Ticket Types</Typography>
                        </CardHeader>
                        <ChartContainer>
                            {typeChartData.labels.length > 0 ? (
                                <Pie data={typeChartData} options={chartOptions} />
                            ) : (
                                <Typography variant="subtitle1" color="textSecondary">
                                    No ticket type data available
                                </Typography>
                            )}
                        </ChartContainer>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={6}>
                    <StyledCard>
                        <CardHeader>
                            <Typography variant="h6">Ticket Statuses</Typography>
                        </CardHeader>
                        <ChartContainer>
                            {statusChartData.labels.length > 0 ? (
                                <Pie data={statusChartData} options={chartOptions} />
                            ) : (
                                <Typography variant="subtitle1" color="textSecondary">
                                    No ticket status data available
                                </Typography>
                            )}
                        </ChartContainer>
                    </StyledCard>
                </Grid>
            </Grid>

            {/* Detailed Tables Section */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={2}>
                        <Box p={2}>
                            <Typography variant="h6">Ticket Types Breakdown</Typography>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Type</TableCell>
                                        <TableCell align="right">Count</TableCell>
                                        <TableCell align="right">Percentage</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {typeDetails.length > 0 ? (
                                        typeDetails.map((row) => (
                                            <TableRow key={row.type}>
                                                <TableCell component="th" scope="row">
                                                    {row.type}
                                                </TableCell>
                                                <TableCell align="right">{row.count}</TableCell>
                                                <TableCell align="right">{row.percentage}%</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">
                                                No ticket type data available
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={2}>
                        <Box p={2}>
                            <Typography variant="h6">Ticket Statuses Breakdown</Typography>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Count</TableCell>
                                        <TableCell align="right">Percentage</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {statusDetails.length > 0 ? (
                                        statusDetails.map((row) => (
                                            <TableRow key={row.status}>
                                                <TableCell component="th" scope="row">
                                                    <Chip 
                                                        label={row.status} 
                                                        color={getStatusColor(row.status)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">{row.count}</TableCell>
                                                <TableCell align="right">{row.percentage}%</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">
                                                No ticket status data available
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}