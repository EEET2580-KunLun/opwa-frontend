// src/App.jsx
import {BrowserRouter, useLocation} from 'react-router-dom';
import PageLayout from "./modules/auth/component/welcoming/PageLayout.jsx";
import AdminLayout from "./modules/staff/components/layout/AdminLayout.jsx";
import RouteConfig from "./app/route/RouteConfig.jsx";
import {Toaster} from 'sonner'

// This component determines which layout to use based on the route
const AppLayout = () => {
    const location = useLocation();
    // Check if the path starts with /admin, /operator, or /ticket-agent
    const isAuthenticatedRoute = /^\/(admin|operator|ticket-agent)/.test(location.pathname);
    const isNotFoundRoute = /^\/(400|401|403|404|500)/.test(location.pathname);

    if (isNotFoundRoute) {
        return <RouteConfig />;
    }

    return (
        <>
            {isAuthenticatedRoute ? (
                <AdminLayout>
                    <RouteConfig />
                </AdminLayout>
            ) : (
                <PageLayout mainBody={<RouteConfig />} />
            )}
        </>
    );
};


function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-center" />
            {/*<PageLayout mainBody={<RouteConfig />} />*/}
            <AppLayout/>
        </BrowserRouter>
    );
}

export default App;