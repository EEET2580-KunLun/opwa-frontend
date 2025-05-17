import { STATISTICS_ENDPOINTS } from '../../../app/config/Api';
import { apiSlice } from '../../../app/config/api/apiSlice';


export const statisticsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTicketAnalytics: builder.query({
            query: () => ({
                url: STATISTICS_ENDPOINTS.TICKETS,
                method: 'GET'
            }),
            transformResponse: (response) => response.data || {
                ticket_type_counts: [],
                ticket_status_counts: [],
                total_tickets: 0
            }
        }),

        getUserAnalytics: builder.query({
            query: () => ({
                url: STATISTICS_ENDPOINTS.USERS,
                method: 'GET'
            }),
            transformResponse: (response) => response.data || {
                user_type_counts: [],
                total_users: 0
            }
        })
    }),
});

export const {
    useGetTicketAnalyticsQuery,
    useGetUserAnalyticsQuery
} = statisticsApiSlice;