import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {login, logout, selectXSRFToken} from "../../../modules/auth/store/authSlice.js";
import {API_CONFIG, AUTH_ENDPOINTS} from "../Api.js";
import {store} from "../../store/store.js";
const baseQuery = fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    prepareHeaders: (headers) => {
        const state = store.getState();
        const token = selectXSRFToken(state);
        if (token) {
            headers.set('X-XSRF-TOKEN', token);
        } else {
            console.warn('No XSRF token found in state');
    }
        return headers;
    },
    credentials: 'include', // Include cookies in requests
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error?.status === 401 || result.error?.status === 403) {        // If we get a 401 or 403, try to refresh the token
        console.log('Refreshing token...');
        const refreshResult = await baseQuery({ url: AUTH_ENDPOINTS.REFRESH_TOKEN, method: 'POST' }, api, extraOptions);
        console.log('Refresh result:', refreshResult);
        if (refreshResult?.data) {
            api.dispatch(login(refreshResult.data));
            //retry the initial query with new token
            result = await baseQuery(args, api, extraOptions);
        } else {
            api.dispatch(logout());
        }
    }
    return result;
}

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    endpoints: () => ({})
})

