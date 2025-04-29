// src/App.jsx
import { BrowserRouter } from 'react-router-dom';
import PageLayout from "./modules/auth/component/welcoming/PageLayout.jsx";
import RouteConfig from "./app/route/RouteConfig.jsx";
import {useEffect, useRef} from "react";
import {Toaster, toast} from 'sonner'
import {CSRF_ENDPOINTS} from "./app/config/Api.js";
import { useDispatch } from 'react-redux';
import { setXSRFToken } from './modules/auth/store/authSlice';

function App() {
    // Import dispatch from redux
    const dispatch = useDispatch();
    const csrfFetchedRef = useRef(false);

    // get CSRF token from server before any API calls
    useEffect(() => {
        if (csrfFetchedRef.current) return; // Prevent duplicate calls
        const fetchCSRF = async () => {
            try {
                const response = await fetch(CSRF_ENDPOINTS.GET, { credentials: 'include' });
                const data = await response.json();
                dispatch(setXSRFToken(data.token));
                toast.success('CSRF token fetched successfully');
                csrfFetchedRef.current = true; // Mark as fetched
            } catch (err) {
                toast.error(`Failed to fetch CSRF token: ${err.message}`);
                console.error('CSRF fetch error:', err);
                csrfFetchedRef.current = true; // Mark as fetched
            }
        };

        fetchCSRF();
    }, [dispatch]);
    return (
        <BrowserRouter>
            <Toaster position="top-center" />
            <PageLayout mainBody={<RouteConfig />} />
        </BrowserRouter>
    );
}

export default App;