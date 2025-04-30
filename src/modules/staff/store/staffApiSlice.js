import {apiSlice} from "../../../app/config/api/apiSlice.js";
import {STAFF_ENDPOINTS} from "../../../app/config/Api.js";
export const staffApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        fetchAllStaff: builder.mutation({
            query: () => ({
                url: STAFF_ENDPOINTS.FETCH_ALL,
                method: 'GET',
            }),
        }),
        fetchStaffById: builder.mutation({
            query: (staffData) => ({
                url: STAFF_ENDPOINTS.FETCH_BY_ID(staffData.id),
                method: 'GET',
            }),
        }),
        createStaff: builder.mutation({
            query: (staffData) => ({
                url: STAFF_ENDPOINTS.CREATE,
                method: 'POST',
                body: {
                    email: staffData.email,
                    username: staffData.username,
                    password: staffData.password,
                    firstName: staffData.firstName,
                    middleName: staffData.middleName,
                    lastName: staffData.lastName,
                    nationalId: staffData.nationalId,
                    phoneNumber: staffData.phoneNumber,
                    dateOfBirth: staffData.dateOfBirth,
                    employed: staffData.employed,
                    role: staffData.role,
                    shift: staffData.shift,
                    address: staffData.address
                },
            }),
        }),
        updateStaff: builder.mutation({
            query: (staffData) => ({
                url: STAFF_ENDPOINTS.UPDATE(),
                method: 'PUT',
                body: {
                    email: staffData.email,
                    username: staffData.username,
                    password: staffData.password,
                    firstName: staffData.firstName,
                    middleName: staffData.middleName,
                    lastName: staffData.lastName,
                    nationalId: staffData.nationalId,
                    phoneNumber: staffData.phoneNumber,
                    dateOfBirth: staffData.dateOfBirth,
                    employed: staffData.employed,
                    role: staffData.role,
                    shift: staffData.shift,
                    address: staffData.address
                },
            }),
        }),
        deleteStaff: builder.mutation({
            query: (staffData) => ({
                url: STAFF_ENDPOINTS.DELETE(staffData.id),
                method: 'DELETE',
            }),
        }),
        uploadStaffAvatar: builder.mutation({
            query: ({staffId, formData}) => ({
                url: STAFF_ENDPOINTS.UPLOAD_AVATAR(staffId),
                method: 'POST',
                body: formData,
            }),
        }),
        deleteStaffAvatar: builder.mutation({
            query: (staffId) => ({
                url: STAFF_ENDPOINTS.DELETE_AVATAR(staffId),
                method: 'DELETE',
            }),
        }),
        inviteStaff: builder.mutation({
            query: () => ({
                url: STAFF_ENDPOINTS.INVITE_STAFF,
                method: 'POST',
            }),
        }),
    }),
})

export const {
    useFetchAllStaffMutation,
    useFetchStaffByIdMutation,
    useCreateStaffMutation,
    useUpdateStaffMutation,
    useDeleteStaffMutation,
    useUploadAvatarMutation,
    useDeleteAvatarMutation
} = staffApiSlice;