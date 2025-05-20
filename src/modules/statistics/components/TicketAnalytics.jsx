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
    Chip,
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
import { Pie, Bar } from 'react-chartjs-2';

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
    'rgba(255, 159, 64, 0.8)',
];

const statusColors = [
    'rgba(40, 167, 69, 0.8)',    // Green for ACTIVE
    'rgba(108, 117, 125, 0.8)',  // Gray for INACTIVE
    'rgba(220, 53, 69, 0.8)',    // Red for EXPIRED
];

const guestColors = [
    'rgba(255, 159, 64, 0.8)',  // Orange for guest tickets
    'rgba(54, 162, 235, 0.8)',  // Blue for regular tickets
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

// Format currency
const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(value);
};

export default function TicketAnalytics() {
    // Query internal analytics
    const {
        data: analytics,
        isLoading,
        error
    } = useGetTicketAnalyticsQuery();

    console.log(analytics);

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

    // Guest ticket percentage chart data
    const guestChartData = {
        labels: ['Guest Tickets', 'Regular Tickets'],
        datasets: [
            {
                data: [
                    analytics?.guest_ticket_percentage || 0,
                    100 - (analytics?.guest_ticket_percentage || 0)
                ],
                backgroundColor: guestColors,
                borderColor: guestColors.map(color => color.replace('0.8', '1')),
                borderWidth: 1,
            },
        ],
    };

    // Monthly revenue chart data
    const monthlyRevenueData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: '2025 Monthly Revenue',
                data: analytics?.monthly_revenues || new Array(12).fill(0),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Chart options
    const pieChartOptions = {
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

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return formatCurrency(context.raw);
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return formatCurrency(value);
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

    // Additional statistics
    const avgRevenuePerTicket = analytics?.total_tickets > 0
        ? (analytics.total_revenue / analytics.total_tickets).toFixed(2)
        : 0;

    const peakMonth = analytics?.monthly_revenues?.reduce(
        (max, revenue, index, arr) => revenue > arr[max] ? index : max, 0
    );

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

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

            {/* Overview Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={6}>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>
                                Tickets Sold
                            </Typography>
                            <Typography variant="h3" color="primary">
                                {analytics?.total_tickets || 0}
                            </Typography>
                            <Typography variant="subtitle1" color="textSecondary">
                                Total tickets issued across all types
                            </Typography>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={6}>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>
                                Total Revenue
                            </Typography>
                            <Typography variant="h3" color="secondary">
                                {formatCurrency(analytics?.total_revenue || 0)}
                            </Typography>
                            <Typography variant="subtitle1" color="textSecondary">
                                Average of {formatCurrency(avgRevenuePerTicket)} per ticket
                            </Typography>
                        </CardContent>
                    </StyledCard>
                </Grid>
            </Grid>

            {/* Monthly Revenue Chart */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12}>
                    <StyledCard>
                        <CardHeader>
                            <Typography variant="h6">Monthly Revenue 2025</Typography>
                        </CardHeader>
                        <ChartContainer sx={{ height: 400 }}>
                            <Bar data={monthlyRevenueData} options={barChartOptions} />
                        </ChartContainer>
                        <Box p={2} pt={0}>
                            <Typography variant="body2" color="textSecondary">
                                Peak revenue month: {monthNames[peakMonth]} - {formatCurrency(analytics?.monthly_revenues?.[peakMonth] || 0)}
                            </Typography>
                        </Box>
                    </StyledCard>
                </Grid>
            </Grid>

            {/* Ticket Distribution Charts */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={4}>
                    <StyledCard>
                        <CardHeader>
                            <Typography variant="h6">Ticket Types</Typography>
                        </CardHeader>
                        <ChartContainer>
                            {typeChartData.labels.length > 0 ? (
                                <Pie data={typeChartData} options={pieChartOptions} />
                            ) : (
                                <Typography variant="subtitle1" color="textSecondary">
                                    No ticket type data available
                                </Typography>
                            )}
                        </ChartContainer>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={4}>
                    <StyledCard>
                        <CardHeader>
                            <Typography variant="h6">Ticket Statuses</Typography>
                        </CardHeader>
                        <ChartContainer>
                            {statusChartData.labels.length > 0 ? (
                                <Pie data={statusChartData} options={pieChartOptions} />
                            ) : (
                                <Typography variant="subtitle1" color="textSecondary">
                                    No ticket status data available
                                </Typography>
                            )}
                        </ChartContainer>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={4}>
                    <StyledCard>
                        <CardHeader>
                            <Typography variant="h6">Guest vs Regular Tickets</Typography>
                        </CardHeader>
                        <ChartContainer>
                            <Pie data={guestChartData} options={pieChartOptions} />
                        </ChartContainer>
                        <Box p={2} pt={0}>
                            <Typography variant="body2" color="textSecondary">
                                Guest tickets: {(analytics?.guest_ticket_percentage || 0).toFixed(2)}%
                            </Typography>
                        </Box>
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