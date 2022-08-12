import { HashRouter, Route, Routes } from "react-router-dom";
import GalleryPage from "./GalleryPage";
import MainPage from "./MainPage";
import Navbar from "./Navbar";
import NotFoundPage from "./NotFoundPage";

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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </HashRouter>
    </div>
  );
};

export default App;
