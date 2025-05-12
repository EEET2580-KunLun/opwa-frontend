import {setStaff} from "../store/staffSlice.js";
import {useDispatch} from "react-redux";
import {useFetchAllStaffMutation} from "../store/staffApiSlice.js";

// useStaffList.js - Manages list of staff
export const useStaffList = () => {
    const dispatch = useDispatch();
    const [fetchAllStaff,{isLoading, isError}] = useFetchAllStaffMutation();

    const fetchStaffList = async () => {
        try {
            const response = await fetchAllStaff();
            if (isError) {
                console.error("Error fetching staff list:", response.error);
                return;
            }
            if (response.data?.meta?.status === 200) {
                dispatch(setStaff(response.data.data));
            } else {
                console.error("Error fetching staff list:", response.data?.meta?.message);
            }
        } catch(err){
            console.error('fetch staff error:', err);
        }
    };
    return {isLoading, fetchStaffList };
};