import { HashRouter, Route, Routes } from "react-router-dom";
import MainPage from "./Pages/MainPage";
import Navbar from "./Components/Navbar";
import AdminPage from "./Pages/AdminPage";

const App = (): JSX.Element => {
  return (
    <div className="app">
      <Navbar />
      <HashRouter>
        <Routes>
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="*" element={<MainPage />} />
        </Routes>
      </HashRouter>
    </div>
  );
};

export default App;
