import { apiSlice } from "../../../app/config/api/apiSlice.js";
import { STATION_ENDPOINTS } from "../../../app/config/Api.js";
import { convertToSnakeCase } from "../../../shared/utils.js";

export const stationApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        fetchAllStations: builder.query({
            query: (params = {}) => {
                const {
                    page = 0,
                    size = 10,
                    sortBy = 'name',
                    direction = 'ASC',
                    searchTerm = '',
                    active = null
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
                
                // Add active filter if specified
                if (active !== null) {
                    queryParams.active = active;
                }

                return {
                    url: STATION_ENDPOINTS.FETCH_ALL,
                    method: 'GET',
                    params: queryParams
                };
            },
            transformResponse: (response) => {
                // Extract data from the paginated response
                if (response?.data) {
                    return response.data;
                }
                return { content: [], page: 0, size: 0, total_elements: 0, total_pages: 0, last: true };
            },
            providesTags: ['Stations']
        }),

        // Other endpoints remain unchanged
        fetchStationById: builder.query({
            query: (id) => ({
                url: STATION_ENDPOINTS.FETCH_BY_ID(id),
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'Station', id }]
        }),

        createStation: builder.mutation({
            query: (stationData) => ({
                url: STATION_ENDPOINTS.CREATE,
                method: 'POST',
                body: convertToSnakeCase(stationData)
            }),
            invalidatesTags: ['Stations']
        }),

        updateStation: builder.mutation({
            query: ({ id, stationData }) => ({
                url: STATION_ENDPOINTS.UPDATE(id),
                method: 'PUT',
                body: convertToSnakeCase(stationData)
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Station', id },
                'Stations'
            ]
        }),

        deleteStation: builder.mutation({
            query: (id) => ({
                url: STATION_ENDPOINTS.DELETE(id),
                method: 'DELETE',
            }),
            invalidatesTags: ['Stations']
        }),
    }),
});

export const {
    useFetchAllStationsQuery,
    useFetchStationByIdQuery,
    useCreateStationMutation,
    useUpdateStationMutation,
    useDeleteStationMutation
} = stationApiSlice;