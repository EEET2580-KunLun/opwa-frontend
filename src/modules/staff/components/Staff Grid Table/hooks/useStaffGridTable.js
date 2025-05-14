import {setStaff} from "../../../store/staffSlice.js";
import {useDispatch, useSelector} from "react-redux";
import {useDeleteStaffMutation} from "../../../store/staffApiSlice.js";
import {toast} from "sonner";
import {selectStaffs} from "../../../store/staffSlice.js";

export const useStaffGridTable = (staffData) => {
    const currentStaff = staffData;
    const dispatch = useDispatch();
    const [deleteStaffMutation, {isLoading}] = useDeleteStaffMutation();
    const staffList = useSelector(selectStaffs);

    const deleteStaff = async () => {
        if (!currentStaff || !currentStaff.id) return;

        try {
            const response = await deleteStaffMutation(currentStaff);

            // Better error handling
            if (response.error) {
                toast.error(`Error deleting staff: ${response.error.message || 'Unknown error'}`);
                return;
            }

            // Success case
            if (response.data) {
                // Create a new array by filtering out the deleted staff
                const updatedStaffList = staffList.filter(staff => staff.id !== currentStaff.id);

                // Update Redux state with the new array
                dispatch(setStaff(updatedStaffList));

                toast.success(`Staff ${currentStaff.username || 'member'} deleted successfully`);
            }
        } catch(err) {
            toast.error(`Error deleting staff: ${err.message || 'Unknown error'}`);
            throw err;
        }
    };

    return {isLoading, deleteStaff};
};