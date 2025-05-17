import { createApi } from '@reduxjs/toolkit/query/react';
import { TICKET_ENDPOINTS } from '../../../app/config/Api';
import { apiSlice } from '../../../app/config/api/apiSlice';

// Mock data for development
const mockTicketTypes = [
    { key: 'oneway', name: 'One-way Ticket', price: 20000, description: 'Valid for a single journey on any line' },
    { key: 'daily', name: 'Daily Ticket', price: 40000, description: 'Unlimited travel for 24 hours' },
    { key: 'monthly_student', name: 'Monthly Student Ticket', price: 150000, description: 'Unlimited travel for students for 30 days' },
    { key: 'monthly_adult', name: 'Monthly Adult Ticket', price: 250000, description: 'Unlimited travel for 30 days' },
    { key: 'threeday', name: 'Three-day Ticket', price: 90000, description: 'Unlimited travel for 3 days' },
    { key: 'free', name: 'Free Ticket', price: 0, description: 'Special purposes only' }
];

const mockPurchaseHistory = [
    { id: 1, typeName: 'One-way Ticket', quantity: 2, paymentMethod: 'cash', timestamp: '2025-05-14T09:30:00' },
    { id: 2, typeName: 'Monthly Student Ticket', quantity: 1, paymentMethod: 'ewallet', timestamp: '2025-05-13T14:20:00' },
    { id: 3, typeName: 'Daily Ticket', quantity: 1, paymentMethod: 'cash', timestamp: '2025-05-13T10:15:00' },
    { id: 4, typeName: 'Three-day Ticket', quantity: 2, paymentMethod: 'cash', timestamp: '2025-05-12T16:45:00' },
];

// Custom baseQuery that returns mock data (to be replaced with real API later)
const mockBaseQuery = () => async (args) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Route the mock responses based on the endpoint
    const { url, method } = args;

    if (url === '/tickets/types' && method === 'GET') {
        return { data: mockTicketTypes };
    }

    if (url === '/tickets/history' && method === 'GET') {
        return { data: mockPurchaseHistory };
    }

    if (url === '/tickets/all' && method === 'GET') {
        return { data: mockPurchaseHistory.map(item => ({
                ...item,
                agentId: 'AGENT-' + Math.floor(Math.random() * 1000)
            })) };
    }

    if (url === '/tickets/purchase' && method === 'POST') {
        // Simulate purchase transaction
        return {
            data: {
                transactionId: 'TRX-' + Date.now(),
                success: true,
                message: 'Tickets issued successfully'
            }
        };
    }

    // Default fallback
    return { error: { status: 404, data: 'Not found' } };
};

// Create the API slice with mock data
export const ticketApi = createApi({
    reducerPath: 'ticketApi',
    baseQuery: mockBaseQuery(),
    endpoints: (builder) => ({
        getTicketTypes: builder.query({
            query: () => ({
                url: '/tickets/types',
                method: 'GET',
            }),
            transformResponse: (response) => {
                // Add allowQuantity property
                return response.map(type => ({
                    ...type,
                    allowQuantity: true
                }));
            }
        }),
        createPurchase: builder.mutation({
            query: (purchaseData) => ({
                url: '/tickets/purchase',
                method: 'POST',
                body: purchaseData,
            }),
        }),
        getPurchaseHistory: builder.query({
            query: () => ({
                url: '/tickets/history',
                method: 'GET',
            }),
            providesTags: ['Purchases'],
        }),
        getAllPurchases: builder.query({
            query: () => ({
                url: '/tickets/all',
                method: 'GET',
            }),
            providesTags: ['Purchases'],
        }),
    }),
});

export const {
    useGetTicketTypesQuery,
    useCreatePurchaseMutation,
    useGetPurchaseHistoryQuery,
    useGetAllPurchasesQuery,
} = ticketApi;