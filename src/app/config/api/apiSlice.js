import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {setErrorCode ,login, logout, selectXSRFToken} from "../../../modules/auth/store/authSlice.js";
import {API_CONFIG, AUTH_ENDPOINTS} from "../Api.js";
import {store} from "../../store/store.js";

// Check if we're already refreshing to prevent multiple refresh requests
let isRefreshing = false;
let refreshPromise = null;

const baseQuery = fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    prepareHeaders: (headers) => {

        // get xsrf token from cookie instead of
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

export const baseQueryWithReauth = async (args, api, extraOptions) => {
    try {
        let result = await baseQuery(args, api, extraOptions);

        if(result.error?.status === 403){
            // Handle 403 Forbidden error
            api.dispatch(setErrorCode(403));
            return result;
        }

        if(result.error?.status === 500){
            // Handle 500 Internal Server Error
            api.dispatch(setErrorCode(500));
            return result;
        }

        if(result.error?.status === 404){
            // Handle 404 Bad Request
            api.dispatch(setErrorCode(404));
            return result;
        }

        if(result.error?.status === 400){
            // Handle 400 Bad Request
            api.dispatch(setErrorCode(400));
            return result;
        }

        // Check if the token has expired
        if (result.error?.status === 401) {
            // Only try to refresh once at a time
            if(!isRefreshing) {
                isRefreshing = true;
                try {
                    // Set a timeout for refresh token request
                    const  timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Refresh token request timeout')), 10000)
                    );

                    refreshPromise = baseQuery({
                        url: AUTH_ENDPOINTS.REFRESH_TOKEN,
                        method: 'POST'
                    }, api, extraOptions);

                    const refreshResult = await Promise.race([refreshPromise, timeoutPromise]);

                    if (refreshResult?.data?.meta?.status === 200) {
                        // Successfully refreshed, update auth state
                        api.dispatch(login(refreshResult));

                        // Retry the original query with new token
                        result = await baseQuery(args, api, extraOptions);
                    } else {
                        // api.dispatch(setErrorCode(401));
                        // Refresh failed, log out
                        api.dispatch(logout());
                    }
                } catch (error){
                    console.error("Token refresh failed: ", error);
                    // api.dispatch(setErrorCode(401));
                    api.dispatch(logout());
                } finally {
                    isRefreshing = false;
                    refreshPromise = null;
                }
            }else if(refreshPromise){
                // Wait for the ongoing refresh request
                try {
                    await refreshPromise;
                    result = await baseQuery(args, api, extraOptions);
                }catch(error){
                    console.error('Waiting for token refresh failed:', error);
                }
            }
            // console.log('Refreshing token...');
            // const refreshResult = await baseQuery({ url: AUTH_ENDPOINTS.REFRESH_TOKEN, method: 'POST' }, api, extraOptions);
            // console.log('Refresh result:', refreshResult);
            // if (refreshResult?.data) {
            //     api.dispatch(login(refreshResult.data));
            //     //retry the initial query with new token
            //     result = await baseQuery(args, api, extraOptions);
            // } else {
            //     api.dispatch(logout());
            // }
            return result;
        }
        // none of the above errors
        if (result.error) {
            api.dispatch(setErrorCode(500));
        }
        return result;
    }catch(error){
        console.error('API request failed:', error);
        return { error: { status: 'FETCH_ERROR', error: error.message } };
    }


}

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    endpoints: () => ({}),
})

