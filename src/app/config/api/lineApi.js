import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './apiSlice';

export const lineApi = createApi({
    reducerPath: 'lineApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Line', 'Schedule', 'Trip', 'Station'],
    endpoints: (builder) => ({
        // Metro Lines
        getLines: builder.query({
            query: () => ({
                url: '/lines',
                method: 'GET',
            }),
            transformResponse: (response) => response.data,
            providesTags: ['Line']
        }),

        getLineById: builder.query({
            query: (id) => ({
                url: `/lines/${id}`,
                method: 'GET',
            }),
            transformResponse: (response) => response.data,
            providesTags: (result, error, id) => [{ type: 'Line', id }]
        }),

        createLine: builder.mutation({
            query: (line) => ({
                url: '/lines',
                method: 'POST',
                body: line,
            }),
            transformResponse: (response) => response.data,
            invalidatesTags: ['Line']
        }),

        updateLine: builder.mutation({
            query: ({ id, ...line }) => ({
                url: `/lines/${id}`,
                method: 'PUT',
                body: line,
            }),
            transformResponse: (response) => response.data,
            invalidatesTags: (result, error, { id }) => [{ type: 'Line', id }, 'Line']
        }),

        deleteLine: builder.mutation({
            query: (id) => ({
                url: `/lines/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Line']
        }),

        // Line Scheduling
        generateLineSchedule: builder.mutation({
            query: (id) => ({
                url: `/lines/${id}/schedule/generate`,
                method: 'POST',
            }),
            transformResponse: (response) => response.data,
            invalidatesTags: (result, error, id) => [{ type: 'Schedule', id }, 'Schedule']
        }),

        getLineSchedule: builder.query({
            query: (id) => ({
                url: `/lines/${id}/schedule/overview`,
                method: 'GET',
            }),
            transformResponse: (response) => response.data,
            providesTags: (result, error, id) => [{ type: 'Schedule', id }]
        }),

        getLineTrips: builder.query({
            query: ({ id, page = 0, size = 20 }) => ({
                url: `/lines/${id}/trips`,
                method: 'GET',
                params: { page, size },
            }),
            transformResponse: (response) => response.data,
            providesTags: (result, error, { id }) => [{ type: 'Trip', id }]
        }),

        // Line Suspension
        suspendLine: builder.mutation({
            query: (suspensionReq) => ({
                url: '/lines/suspend',
                method: 'POST',
                body: suspensionReq,
            }),
            transformResponse: (response) => response.data,
            invalidatesTags: (result, error, { lineId }) => [
                { type: 'Line', id: lineId },
                'Line',
                { type: 'Trip', id: lineId },
                'Trip'
            ]
        }),

        resumeLine: builder.mutation({
            query: (id) => ({
                url: `/lines/${id}/resume`,
                method: 'POST',
            }),
            transformResponse: (response) => response.data,
            invalidatesTags: (result, error, id) => [
                { type: 'Line', id },
                'Line',
                { type: 'Trip', id },
                'Trip'
            ]
        }),

        // Trip Search
        findTrips: builder.query({
            query: ({ departureStationId, arrivalStationId, departureTime }) => ({
                url: '/lines/trips/search',
                method: 'GET',
                params: {
                    departureStationId,
                    arrivalStationId,
                    departureTime,
                },
            }),
            transformResponse: (response) => response.data
        }),

        findUpcomingTrips: builder.query({
            query: ({ stationId, fromTime }) => ({
                url: '/lines/trips/upcoming',
                method: 'GET',
                params: {
                    stationId,
                    fromTime,
                },
            }),
            transformResponse: (response) => response.data
        }),

        // Stations
        getStations: builder.query({
            query: () => ({
                url: '/stations',
                method: 'GET',
            }),
            transformResponse: (response) => response.data,
            providesTags: ['Station']
        }),

        getStationById: builder.query({
            query: (id) => ({
                url: `/stations/${id}`,
                method: 'GET',
            }),
            transformResponse: (response) => response.data,
            providesTags: (result, error, id) => [{ type: 'Station', id }]
        }),

        createStation: builder.mutation({
            query: (station) => ({
                url: '/stations',
                method: 'POST',
                body: station,
            }),
            transformResponse: (response) => response.data,
            invalidatesTags: ['Station']
        }),

        updateStation: builder.mutation({
            query: ({ id, ...station }) => ({
                url: `/stations/${id}`,
                method: 'PUT',
                body: station,
            }),
            transformResponse: (response) => response.data,
            invalidatesTags: (result, error, { id }) => [{ type: 'Station', id }, 'Station']
        }),

        deleteStation: builder.mutation({
            query: (id) => ({
                url: `/stations/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Station']
        })
    })
});

export const {
    useGetLinesQuery,
    useGetLineByIdQuery,
    useCreateLineMutation,
    useUpdateLineMutation,
    useDeleteLineMutation,
    useGenerateLineScheduleMutation,
    useGetLineScheduleQuery,
    useGetLineTripsQuery,
    useSuspendLineMutation,
    useResumeLineMutation,
    useFindTripsQuery,
    useFindUpcomingTripsQuery,
    useGetStationsQuery,
    useGetStationByIdQuery,
    useCreateStationMutation,
    useUpdateStationMutation,
    useDeleteStationMutation
} = lineApi;