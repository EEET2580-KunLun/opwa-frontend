import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../welcoming/Styles.css';


const NavbarInWelcomePage = () => {
    const location = useLocation();

    return(
        <nav>
            <div className="navbar-component">
                {
                    location.pathname !== "/" ? <Link to="/" className="tab welcome-page">Welcome</Link> : null
                }

                {
                    location.pathname !== "/about" ? <Link to="/about" className="tab about-page">About</Link> : null
                }

                {
                    location.pathname !== "/login" ? <Link to="/login" className="tab login-page">Login as Staff</Link> : null
                }

            </div>
        </nav>

    )
}

export default NavbarInWelcomePage;