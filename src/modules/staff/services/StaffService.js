import ApiUtils from "../../../app/config/ApiUtils.js";
import {STAFF_ENDPOINTS} from "../../../app/config/Api.js";

const StaffService = (() => {
    const fetchStaff = async (staffId) => {
        try {
            return await ApiUtils.get(STAFF_ENDPOINTS.FETCH_BY_ID(staffId), true);
        } catch (error) {
            throw new Error(`Failed to fetch staff data: ${error.message}`);
        }
    };

    const fetchAllStaff = async () => {
        try {
            return await ApiUtils.get(STAFF_ENDPOINTS.FETCH_ALL, true);
        } catch (error) {
            throw new Error(`Failed to fetch staff list: ${error.message}`);
        }
    };

    const createNewStaff = async (staffData) => {
        try {
            return await ApiUtils.post(STAFF_ENDPOINTS.CREATE, staffData, true);
        } catch (error) {
            throw new Error(`Failed to create new staff: ${error.message}`);
        }
    };

    const updateStaff = async (staffId, staffData) => {
        try {
            return await ApiUtils.put(STAFF_ENDPOINTS.UPDATE(staffId), staffData, true);
        } catch (error) {
            throw new Error(`Failed to update staff: ${error.message}`);
        }
    };

    const deleteStaff = async (staffId) => {
        try {
            return await ApiUtils.delete(STAFF_ENDPOINTS.DELETE(staffId), true);
        } catch (error) {
            throw new Error(`Failed to delete staff: ${error.message}`);
        }
    };

    return {
        fetchStaff,
        fetchAllStaff,
        createNewStaff,
        updateStaff,
        deleteStaff
    };
})();

export default StaffService;