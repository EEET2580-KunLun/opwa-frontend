import { pawaApiSlice } from '../../../app/config/api/pawaApiSlice';
import { TICKET_ENDPOINTS } from '../../../app/config/Api.js';

export const pawaTicketApiSlice = pawaApiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get ticket types from PAWA
        getPawaTicketTypes: builder.query({
            query: () => ({
                url: TICKET_ENDPOINTS.TYPES,
                method: 'GET'
            }),
            transformResponse: (response) => {
                return response.map(ticket => ({
                    key: ticket.type,
                    name: ticket.name,
                    price: ticket.price,
                    validHours: ticket.validHours,
                    requirements: ticket.requirements,
                    type: ticket.type,
                    allowQuantity: true,
                    stationCount: ticket.type === 'ONE_WAY'
                }));
            }
        }),

        // Agent ticket purchase
        purchaseTicketsForPassenger: builder.mutation({
            query: (purchaseData) => ({
                url: TICKET_ENDPOINTS.AGENT_PURCHASE,
                method: 'POST',
                body: purchaseData
            }),
            invalidatesTags: ['Passengers']
        }),

        // Get all tickets
        getAllTickets: builder.query({
            query: () => ({
                url: TICKET_ENDPOINTS.ALL,
                method: 'GET'
            }),
            providesTags: ['Tickets']
        })
    }),
});

export const {
    useGetPawaTicketTypesQuery,
    usePurchaseTicketsForPassengerMutation,
    useGetAllTicketsQuery,
} = pawaTicketApiSlice;