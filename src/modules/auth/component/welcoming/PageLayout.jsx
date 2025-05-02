import Navbar from "../navbar/NavbarInWelcomePage.jsx";
import "./Styles.css"

const PageLayout = ({mainBody}) => {
    return(
        <div className="page-layout">
            <Navbar />
            <main className="main">
                {mainBody}
            </main>
        </div>
    )
}

export default PageLayout;