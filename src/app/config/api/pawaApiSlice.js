import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {API_CONFIG} from "../Api.js";

export const pawaApiSlice = createApi({
    reducerPath: 'apiPawa',
    baseQuery: fetchBaseQuery({
        baseUrl: API_CONFIG.PAWA_BASE_URL,
    }),
    endpoints: () => ({}),
});