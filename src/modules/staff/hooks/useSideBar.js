import {logout} from "../../auth/store/authSlice.js";
import {useDispatch} from "react-redux";

export const useSideBar = () => {
    const dispatch = useDispatch();

    const handleLogout = () => {
       dispatch(logout());
    };
    return {handleLogout};
};