import { useState } from 'react';
import StaffService from "../services/StaffService.js";

// useStaffList.js - Manages list of staff
export const useStaffList = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchStaffList = async () => {
        setLoading(true);
        try {
            const data = await StaffService.fetchAllStaff()
            setStaff(data.data);
        } finally {
            setLoading(false);
        }
    };

    return { staff, loading, fetchStaffList };
};