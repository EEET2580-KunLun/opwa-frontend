import {apiSlice} from "../../../app/config/api/apiSlice.js";
import {AUTH_ENDPOINTS} from "../../../app/config/Api.js";
export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: ({email, password}) => ({
                url: AUTH_ENDPOINTS.LOGIN,
                method: 'POST',
                body: {email: email, password: password},
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: AUTH_ENDPOINTS.LOGOUT,
                method: 'POST',
            }),
        }),
        register: builder.mutation({
            query: ({email, password}) => ({
                url: AUTH_ENDPOINTS.REGISTER,
                method: 'POST',
                body: {email: email, password: password},
            }),
        })
    }),
})

export const {
    useLoginMutation,
    useLogoutMutation,
    useRegisterMutation,
} = authApiSlice;