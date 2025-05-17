import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useDispatch} from 'react-redux';
import {login as setLogin} from "../store/authSlice.js";
import {useLoginMutation} from "../store/authApiSlice.js";
import {toast} from "sonner";

export const useLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    // const [loading, setLoading] = useState(false);
    const [login, {isLoading}] = useLoginMutation();
    const dispatch = useDispatch();

    const navigate = useNavigate();

    // Email validation
    const isValidEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.(com|vn)$/;
        return regex.test(email);
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async () => {
        // Validate input fields
        if (!email.trim() || !password.trim()) {
            setError('Please enter your email and password');
            return;
        }

        if (!isValidEmail(email)) {
            setError("Invalid email format. The email must end with '.com' or '.vn'");
            return;
        }

        try {
            const response = await login({email, password});
            // Check if the response has error
            if(response.error){
                setError(response.error?.data?.meta?.message || "Authentication failed");
                return;
            }

            if (response.data?.meta?.status === 200) {
                dispatch(setLogin(response));
                setError('');
                setEmail('');
                setPassword('');

                const role = response.data?.data?.staff?.role;
                toast.success("login successfully")
                switch (role) {
                    case "ADMIN":
                        navigate("/admin/dashboard");
                        break;
                    case "OPERATOR":
                        navigate("/operator/dashboard");
                        break;
                    case "TICKET_AGENT":
                        navigate("/ticket-agent/dashboard");
                        break;
                    default:
                        navigate("/login");
                }
            }else{
                setError(response.data?.meta?.message || "Credentials failed");
            }
        } catch(err){
            setError('Authentication failed. Please try again later.');
            console.error('Login error:', err);
        }
    }

    const handleGoogleLogin = async () => {
        try {
            window.location.href = "http://localhost:8080/oauth2/authorization/google";
            console.log("Google login initiated");
        } catch (err) {
            setError('Google authentication failed. Please try again.');
            console.error('Google login error:', err);
        }
    };
    return {
        email,
        password,
        error,
        isLoading,
        handleEmailChange,
        handlePasswordChange,
        handleSubmit,
        handleGoogleLogin
    };
}