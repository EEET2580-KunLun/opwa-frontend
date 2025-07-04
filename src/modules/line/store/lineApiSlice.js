import { apiSlice } from '../../../app/config/api/apiSlice.js';
import {LINE_ENDPOINTS, STATION_ENDPOINTS} from '../../../app/config/Api.js';
import { convertToSnakeCase } from '../../../shared/utils.js';

export const lineApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getLines: builder.query({
            query: (params = {}) => {
                const {
                    page = 0,
                    size = 10,
                    sortBy = 'name',
                    direction = 'ASC',
                    searchTerm = '',
                    status = ''
                } = params;

                const queryParams = {
                    page,
                    size,
                    sortBy,
                    direction
                };

                // Add search term if provided
                if (searchTerm) {
                    queryParams.search = searchTerm;
                }
                if (status) {
                    queryParams.status = status
                }

                return {
                    url: LINE_ENDPOINTS.FETCH_ALL,
                    method: 'GET',
                    params: queryParams
                };
            },
            transformResponse: (response) => response.data,
            providesTags: ['Line']
        }),

        getLineById: builder.query({
            query: (id) => ({
                url: LINE_ENDPOINTS.FETCH_BY_ID(id),
                method: 'GET',
            }),
            transformResponse: (response) => response.data,
            providesTags: (result, error, id) => [{ type: 'Line', id }]
        }),

       getStations: builder.query({
            query: () => ({
                url: STATION_ENDPOINTS.FETCH_ALL,
                method: 'GET',
                // Request all stations for dropdown by setting large size
                params: {
                    page: 0,
                    size: 1000, // Large enough to get all stations
                    active: true // Only get active stations
                }
            }),
            // Update the transform response to extract stations from paginated structure
            transformResponse: (response) => {
                // Check if response has the new paginated structure
                if (response?.data?.content && Array.isArray(response.data.content)) {
                    return response.data.content;
                }
                // Fallback to handle old response format
                return response?.data || [];
            },
            providesTags: ['Station']
        }),

        createLine: builder.mutation({
            query: (line) => ({
                url: LINE_ENDPOINTS.CREATE,
                method: 'POST',
                body: convertToSnakeCase(line),
            }),
            transformResponse: (response) => response.data,
            invalidatesTags: ['Line']
        }),

        updateLine: builder.mutation({
            query: ({ id, ...line }) => ({
                url: LINE_ENDPOINTS.UPDATE(id),
                method: 'PUT',
                body: convertToSnakeCase(line),
            }),
            transformResponse: (response) => response.data,
            invalidatesTags: (result, error, { id }) => [{ type: 'Line', id }, 'Line']
        }),

        deleteLine: builder.mutation({
            query: (id) => ({
                url: LINE_ENDPOINTS.DELETE(id),
                method: 'DELETE',
            }),
            invalidatesTags: ['Line']
        }),

        // Line Scheduling
       generateLineSchedule: builder.mutation({
            query: ({ id, scheduleData }) => ({
                url: LINE_ENDPOINTS.GENERATE_SCHEDULE(id),
                method: 'POST',
                body: scheduleData || {}  // Add empty object as default
            }),
            transformResponse: (response) => response.data,
            invalidatesTags: (result, error, { id }) => [{ type: 'Schedule', id }, 'Schedule']
        }),

        getLineSchedule: builder.query({
            query: (id) => ({
                url: LINE_ENDPOINTS.GET_SCHEDULE(id),
                method: 'GET',
            }),
            transformResponse: (response) => response.data,
            providesTags: (result, error, id) => [{ type: 'Schedule', id }]
        }),

        getLineTrips: builder.query({
            query: ({ id, page = 0, size = 20 }) => ({
                url: LINE_ENDPOINTS.GET_TRIPS(id),
                method: 'GET',
                params: { page, size },
            }),
            transformResponse: (response) => response.data.content,
            providesTags: (result, error, { id }) => [{ type: 'Trip', id }]
        }),

        // Line Suspension
        suspendLine: builder.mutation({
            query: ({ id, suspensionReq }) => ({
                url: LINE_ENDPOINTS.SUSPEND(id),
                method: 'POST',
                body: convertToSnakeCase(suspensionReq),
            }),
            transformResponse: (response) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'Line', id },
                'Line',
                { type: 'Trip', id },
                'Trip'
            ]
        }),

        resumeLine: builder.mutation({
            query: (id) => ({
                url: LINE_ENDPOINTS.RESUME(id),
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
                url: LINE_ENDPOINTS.FIND_TRIPS,
                method: 'GET',
                params: {
                    departure_station_id: departureStationId,
                    arrival_station_id: arrivalStationId,
                    departure_time: departureTime,
                },
            }),
            transformResponse: (response) => response.data
        }),

        findUpcomingTrips: builder.query({
            query: ({ stationId, fromTime }) => ({
                url: LINE_ENDPOINTS.FIND_UPCOMING_TRIPS,
                method: 'GET',
                params: {
                    station_id: stationId,
                    from_time: fromTime,
                },
            }),
            transformResponse: (response) => response.data
        }),
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
} = lineApiSlice;