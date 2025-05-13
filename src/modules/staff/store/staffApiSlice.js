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

        getCurrentStaffProfile: builder.query({
            query: () => ({
                url: STAFF_ENDPOINTS.FETCH_PROFILE,
                method: 'GET',
            })
        }),

        createStaff: builder.mutation({
            query: (staffData) => {
                // Check if staffData is FormData
                if (staffData instanceof FormData) {
                    return {
                        url: STAFF_ENDPOINTS.CREATE_WITH_PICTURES,
                        method: "POST",
                        body: staffData,
                        formData: true,
                    };
                }

                // Otherwise return JSON payload
                return {
                    url: STAFF_ENDPOINTS.CREATE,
                    method: 'POST',
                    body: {
                        email: staffData.email,
                        username: staffData.username,
                        password: staffData.password,
                        first_name: staffData.firstName,
                        middle_name: staffData.middleName,
                        last_name: staffData.lastName,
                        national_id: staffData.nationalId,
                        phone_number: staffData.phoneNumber,
                        date_of_birth: staffData.dateOfBirth,
                        employed: staffData.employed,
                        role: staffData.role,
                        shift: staffData.shift,
                        address: staffData.address
                    },
                };
            },
            invalidatesTags: ["Staff"]
        }),

        /**
         * Used by staff members to update their own profile info
         *
         * */
        updateStaffProfile: builder.mutation({
            query: (staffData) => {
                if(staffData instanceof FormData){
                    return {
                        url: STAFF_ENDPOINTS.UPDATE(),
                        method: "PUT",
                        body: staffData,
                        formData: true,
                    };
                }
                return {
                    url: STAFF_ENDPOINTS.UPDATE_PROFILE,
                    method: "PUT",
                    body: staffData,
                };
            },
            invalidatesTags: ["Staff"]
        }),

        updateNationalIdImages: builder.mutation({
            query: (formData) => ({
                url: STAFF_ENDPOINTS.UPDATE_NATIONAL_ID,
                method: "PUT",
                body: formData,
                formData: true,
            }),
            invalidatesTags: ["Staff"]
        }),

        /**
         * Used by admins to update any staff member's info
         * accessed via /v1/staffs/{id}
         * */
        updateStaff: builder.mutation({
            query: ({ staffId, staffData }) => ({
                url: STAFF_ENDPOINTS.UPDATE(staffId),
                method: 'PUT',
                body: staffData,
            }),
            invalidatesTags: (result, error, { staffId }) => [
                { type: 'Staff', id: staffId },
                'Staff'
            ]
        }),

        deleteStaff: builder.mutation({
            query: (staffData) => ({
                url: STAFF_ENDPOINTS.DELETE(staffData.id),
                method: 'DELETE',
            }),
            invalidatesTags: ["Staff"]
        }),

        uploadStaffAvatar: builder.mutation({
            query: ({staffId, formData}) => ({
                url: STAFF_ENDPOINTS.UPLOAD_AVATAR(staffId),
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: (result, error, { staffId }) => [
                { type: 'Staff', id: staffId },
                'Staff'
            ]
        }),

        deleteStaffAvatar: builder.mutation({
            query: (staffId) => ({
                url: STAFF_ENDPOINTS.DELETE_AVATAR(staffId),
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, staffId) => [
                { type: 'Staff', id: staffId },
                'Staff'
            ]
        }),

        toggleStaffEmployment: builder.mutation({
            query: ({staffId, employed}) => ({
                url: STAFF_ENDPOINTS.TOGGLE_EMPLOYMENT(staffId),
                method: 'PATCH',
                body: {employed},
            }),
            invalidatesTags: (result, error, { staffId }) => [
                { type: 'Staff', id: staffId },
                'Staff'
            ]
        }),

        inviteStaff: builder.mutation({
            query: () => ({
                url: STAFF_ENDPOINTS.INVITE_STAFF,
                method: 'POST',
            }),
            invalidatesTags: ["Staff"]
        }),
    }),
})

export const {
    useFetchAllStaffMutation,
    useFetchStaffByIdMutation,
    useCreateStaffMutation,
    useUpdateStaffMutation,
    useDeleteStaffMutation,
    useUploadStaffAvatarMutation,
    useDeleteStaffAvatarMutation,
    useToggleStaffEmploymentMutation,
    useInviteStaffMutation,
    useUpdateStaffProfileMutation,
    useUpdateNationalIdImagesMutation,
} = staffApiSlice;