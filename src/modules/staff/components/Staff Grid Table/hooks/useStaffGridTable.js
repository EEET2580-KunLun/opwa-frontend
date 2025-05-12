import {setStaff} from "../../../store/staffSlice.js";
import {useDispatch, useSelector} from "react-redux";
import {useDeleteStaffMutation} from "../../../store/staffApiSlice.js";
import {toast} from "sonner";
import {selectStaffs} from "../../../store/staffSlice.js";

export const useStaffGridTable = (staffData) => {
    const currentStaff = staffData;
    const dispatch = useDispatch();
    const [deleteStaffMutation, {isLoading, isError}] = useDeleteStaffMutation();
    const staffList = useSelector(selectStaffs);

    const deleteStaff = async () => {
        try {
            const response = await deleteStaffMutation(currentStaff);
            if (isError) {
                toast.error("Error deleting staff", response.error);
                return;
            }
            if (response.data?.meta?.status === 200) {
                // Create a new array by filtering out the deleted staff
                const updatedStaffList = staffList.filter(staff => staff.id !== currentStaff.id);

                // Update Redux state with the new array
                dispatch(setStaff(updatedStaffList));

                toast.success("Staff " + currentStaff.username + " deleted");
            }
        } catch(err){
            toast.error('Error deleting staff', err);
        }
    };
    return {isLoading, deleteStaff};
};