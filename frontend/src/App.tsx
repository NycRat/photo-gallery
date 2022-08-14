import { HashRouter, Route, Routes } from "react-router-dom";
import GalleryPage from "./Pages/GalleryPage";
import MainPage from "./Pages/MainPage";
import Navbar from "./Components/Navbar";
import SubmitPage from "./Pages/SubmitPage";

const App = (): JSX.Element => {

  return (
     <div className="app">
      <Navbar />
      <HashRouter>
        <Routes>
          <Route
            path="/"
            element={<MainPage />}
          />
          <Route
            path="/gallery/:galleryName/*"
            element={<GalleryPage />}
          />
          <Route path="/submit/*" element={<SubmitPage />} />
          <Route path="*" element={<div>404 Page Not Found</div>} />
        </Routes>
      </HashRouter>
    </div>
  );
};

export default App;
