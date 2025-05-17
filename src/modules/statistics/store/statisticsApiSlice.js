import { TICKET_ENDPOINTS } from '../../../app/config/Api';
import { apiSlice } from '../../../app/config/api/apiSlice';


export const statisticsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTicketAnalytics: builder.query({
            query: () => ({
                url: TICKET_ENDPOINTS.ANALYTICS,
                method: 'GET'
            }),
            transformResponse: (response) => response.data || {
                ticket_type_counts: [],
                ticket_status_counts: [],
                total_tickets: 0
            }
        })
    }),
});

export const { useGetTicketAnalyticsQuery } = statisticsApiSlice;
