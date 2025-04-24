import { BrowserRouter } from "react-router-dom";
import PageLayout from "./modules/auth/component/welcoming/PageLayout";
import RouteConfig from "./app/route/RouteConfig";

function App() {

  return (
    <>
      <BrowserRouter>
        <PageLayout
            mainBody={<RouteConfig />}
        ></PageLayout>
      </BrowserRouter>
    </>
  )
}

export default App
