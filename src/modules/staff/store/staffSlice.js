import {createSlice} from '@reduxjs/toolkit';

const staffSlice = createSlice({
    name: 'staff',
    initialState: {
        staffs: [],
    },
    reducers: {
        setStaff(state, action) {
            state.staffs = action.payload;
        },
    }
})

export const {setStaff} = staffSlice.actions;
export default staffSlice.reducer;
export const selectStaffs = (state) => state.staff.staffs;