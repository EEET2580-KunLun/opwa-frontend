import { BrowserRouter } from "react-router-dom";
import PageLayout from "./component/welcoming/PageLayout";
import RouteConfig from "./route/RouteConfig";

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
