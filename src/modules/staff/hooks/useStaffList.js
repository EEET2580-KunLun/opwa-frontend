import { useState } from 'react';
import { useDispatch } from "react-redux";
import { setStaff } from "../store/staffSlice.js";
import { useFetchAllStaffQuery } from "../store/staffApiSlice.js";

// Deprecated but kept for backward compatibility
export const useStaffList = () => {
    const dispatch = useDispatch();
    const [params, setParams] = useState({
        page: 0,
        size: 10,
        sortBy: 'firstName',
        direction: 'ASC',
        employed: null
    });
    
    const { 
        data: staffResponse, 
        isLoading, 
        isFetching,
        refetch
    } = useFetchAllStaffQuery(params);
    
    const staffs = staffResponse?.data?.content || [];
    
    if (staffs.length > 0) {
        dispatch(setStaff(staffs));
    }
    
    return {
        loading: isLoading || isFetching,
        fetchStaffList: refetch
    };
};