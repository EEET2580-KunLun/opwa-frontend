import Navbar from "./navbar/NavbarInWelcomePage";
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