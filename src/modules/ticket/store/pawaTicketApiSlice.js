import { pawaApiSlice } from '../../../app/config/api/pawaApiSlice';

export const pawaTicketApiSlice = pawaApiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPawaTicketTypes: builder.query({
            queryFn: () => {
                return { data: [] };
            }
        }),
    }),
});

export const {
    useGetPawaTicketTypesQuery,
} = pawaTicketApiSlice;