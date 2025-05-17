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

// Import the API endpoint for user analytics
import { useGetUserAnalyticsQuery } from '../store/statisticsApiSlice.js';

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
const roleColors = [
    'rgba(54, 162, 235, 0.8)',   // Blue for TICKET_AGENT
    'rgba(255, 99, 132, 0.8)',   // Red for OPERATOR
    'rgba(255, 206, 86, 0.8)',   // Yellow for ADMIN
    'rgba(75, 192, 192, 0.8)',   // Green for MASTER_ADMIN
    'rgba(153, 102, 255, 0.8)',  // Purple for PASSENGER
];

// Role badge colors
const getRoleColor = (role) => {
    switch (role.toUpperCase()) {
        case 'TICKET_AGENT': return 'info';
        case 'OPERATOR': return 'warning';
        case 'ADMIN': return 'error';
        case 'MASTER_ADMIN': return 'success';
        case 'PASSENGER': return 'default';
        default: return 'default';
    }
};

export default function UserAnalytics() {
    // Query user analytics
    const { 
        data: analytics, 
        isLoading, 
        error 
    } = useGetUserAnalyticsQuery();

    // Chart data preparation
    const userTypeChartData = {
        labels: analytics?.user_type_counts?.map(item => item.user_type) || [],
        datasets: [
            {
                data: analytics?.user_type_counts?.map(item => item.count) || [],
                backgroundColor: roleColors,
                borderColor: roleColors.map(color => color.replace('0.8', '1')),
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
    const userTypeDetails = analytics?.user_type_counts?.map(item => ({
        type: item.user_type,
        count: item.count,
        percentage: analytics.total_users > 0 
            ? ((item.count / analytics.total_users) * 100).toFixed(1) 
            : 0
    })) || [];

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
                <Typography variant="h6" ml={2}>
                    Loading user analytics...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box m={3}>
                <Alert severity="error">
                    Error loading user analytics: {error.message || 'Unknown error'}
                </Alert>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Box mb={3}>
                <Typography variant="h4" component="h1" gutterBottom>
                    User Analytics
                </Typography>
            </Box>

            {/* Overview Card */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Overview
                    </Typography>
                    <Typography variant="h3" color="primary">
                        {analytics?.total_users || 0}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        Total Users Registered
                    </Typography>
                </CardContent>
            </Card>

            {/* Charts Section */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12}>
                    <StyledCard>
                        <CardHeader>
                            <Typography variant="h6">User Role Distribution</Typography>
                        </CardHeader>
                        <ChartContainer>
                            {userTypeChartData.labels.length > 0 ? (
                                <Pie data={userTypeChartData} options={chartOptions} />
                            ) : (
                                <Typography variant="subtitle1" color="textSecondary">
                                    No user data available
                                </Typography>
                            )}
                        </ChartContainer>
                    </StyledCard>
                </Grid>
            </Grid>

            {/* Detailed Tables Section */}
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper elevation={2}>
                        <Box p={2}>
                            <Typography variant="h6">User Types Breakdown</Typography>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Role</TableCell>
                                        <TableCell align="right">Count</TableCell>
                                        <TableCell align="right">Percentage</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {userTypeDetails.length > 0 ? (
                                        userTypeDetails.map((row) => (
                                            <TableRow key={row.type}>
                                                <TableCell component="th" scope="row">
                                                    <Chip 
                                                        label={row.type} 
                                                        color={getRoleColor(row.type)}
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
                                                No user data available
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