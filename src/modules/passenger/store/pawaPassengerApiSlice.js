import { pawaApiSlice } from '../../../app/config/api/pawaApiSlice';
import { PASSENGER_ENDPOINTS } from '../../../app/config/Api.js';

export const pawaPassengerApiSlice = pawaApiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all passengers
        getAllPassengers: builder.query({
            query: () => ({
                url: PASSENGER_ENDPOINTS.ALL,
                method: 'GET'
            }),
            providesTags: ['Passengers']
        }),

        // Get passenger by ID
        getPassengerById: builder.query({
            query: (id) => ({
                url: PASSENGER_ENDPOINTS.FETCH_BY_ID(id),
                method: 'GET'
            }),
            providesTags: (result, error, id) => [{ type: 'Passengers', id }]
        }),
        
        // Create new passenger
        createPassenger: builder.mutation({
            query: (passengerData) => ({
                url: PASSENGER_ENDPOINTS.CREATE,
                method: 'POST',
                body: passengerData
            }),
            invalidatesTags: ['Passengers']
        }),
        
        // Update passenger
        updatePassenger: builder.mutation({
            query: ({ id, ...passengerData }) => ({
                url: PASSENGER_ENDPOINTS.UPDATE(id),
                method: 'PUT',
                body: passengerData
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Passengers', id },
                'Passengers'
            ]
        }),
        
        // Delete passenger
        deletePassenger: builder.mutation({
            query: (id) => ({
                url: PASSENGER_ENDPOINTS.DELETE(id),
                method: 'DELETE'
            }),
            invalidatesTags: ['Passengers']
        })
    }),
});

export const {
    useGetAllPassengersQuery,
    useGetPassengerByIdQuery,
    useCreatePassengerMutation,
    useUpdatePassengerMutation,
    useDeletePassengerMutation,
} = pawaPassengerApiSlice;