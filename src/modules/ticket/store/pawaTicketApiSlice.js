

import { pawaApiSlice } from '../../../app/config/api/pawaApiSlice';
import { TICKET_ENDPOINTS } from '../../../app/config/Api.js';

export const pawaTicketApiSlice = pawaApiSlice.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Fetch the list of ticket types from the PAWA backend.
         * We transform the response so that each ticket gets a unique `key`
         * by appending its index in the array.
         */
        getPawaTicketTypes: builder.query({
            query: () => ({
                url: TICKET_ENDPOINTS.TYPES,
                method: 'GET'
            }),
            transformResponse: (response) => {
                return response.map((ticket, idx) => ({
                    // 👇 unique key per item to prevent React/Redux collisions
                    key: `${ticket.type}-${idx}`,

                    // the display name and price
                    name:        ticket.name,
                    price:       ticket.price,

                    // any other metadata you need
                    validHours:  ticket.validHours,
                    requirements:ticket.requirements,

                    // if it's a one-way ticket, you might track stationCount
                    stationCount: ticket.stationCount ?? null,

                    // allow the user to choose quantity on the UI
                    allowQuantity: true
                }));
            }
        }),

        /**
         * Mutation for an agent purchasing tickets on behalf of a passenger
         */
        purchaseTicketsForPassenger: builder.mutation({
            query: (purchaseData) => ({
                url: TICKET_ENDPOINTS.AGENT_PURCHASE,
                method: 'POST',
                body: purchaseData
            }),
            invalidatesTags: ['Passengers']
        }),

             /**
         * Mutation for an agent purchasing tickets on behalf of a guest
         */
        purchaseTicketsForGuest: builder.mutation({
            query: (purchaseData) => ({
                url: TICKET_ENDPOINTS.AGENT_PURCHASE_GUEST,
                method: 'POST',
                body: purchaseData
            }),
            invalidatesTags: ['Guests']
        }),

        /**
         * Fetch all tickets (e.g. for history or admin view)
         */
        getAllTickets: builder.query({
            query: () => ({
                url: TICKET_ENDPOINTS.ALL,
                method: 'GET'
            }),
            providesTags: ['Tickets']
        })
    })
});

export const {
    useGetPawaTicketTypesQuery,
    usePurchaseTicketsForPassengerMutation,
    usePurchaseTicketsForGuestMutation,
    useGetAllTicketsQuery
} = pawaTicketApiSlice;
