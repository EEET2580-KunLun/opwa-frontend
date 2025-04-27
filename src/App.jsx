// src/App.jsx
import { BrowserRouter } from 'react-router-dom';
import PageLayout from "./modules/auth/component/welcoming/PageLayout.jsx";
import RouteConfig from "./app/route/RouteConfig.jsx";
import SessionTimeoutHandler from "./modules/auth/component/session/SessionTimeoutHandler.jsx";

function App() {
    return (
        <BrowserRouter>
            <SessionTimeoutHandler />
            <PageLayout mainBody={<RouteConfig />} />
        </BrowserRouter>
    );
}

export default App;