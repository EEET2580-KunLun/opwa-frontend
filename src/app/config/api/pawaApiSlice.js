import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {API_CONFIG} from "../Api.js";

const baseQuery = fetchBaseQuery({
    baseUrl: API_CONFIG.PAWA_BASE_URL,
})

export const pawaApiSlice = createApi({
    reducerPath: 'apiPawa',
    endpoints: () => ({}),
})

