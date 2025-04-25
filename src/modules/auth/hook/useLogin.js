import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {login} from '../service/AuthService.js';

export const useLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
            setLoading(true);
            const response = await login(email, password);

            if (response.success) {
                // Store the role of user
                sessionStorage.setItem("userRole", response.role);

                switch (response.role) {
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
                setError(response.message || "Credentials failed");
            }
        } catch(err){
            setError('Authentication failed. Please try again later.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            // Google login logic here
            window.location.href = `/oauth2/authorization/google`;
        } catch (err) {
            setError('Google authentication failed. Please try again.');
            console.error('Google login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return {
        email,
        password,
        error,
        loading,
        handleEmailChange,
        handlePasswordChange,
        handleSubmit,
        handleGoogleLogin
    };
}