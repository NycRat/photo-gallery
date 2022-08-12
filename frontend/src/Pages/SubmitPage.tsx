import { Route, Routes, useNavigate } from "react-router-dom";

const SubmitPage = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="submit-page">
            <div className="submit-option" onClick={() => navigate("photo")}>
              <h1>Submit Photo</h1>
            </div>
            <div className="submit-option" onClick={() => navigate("album")}>
              <h1>Submit Album</h1>
            </div>
            <div className="submit-option" onClick={() => navigate("gallery")}>
              <h1>Submit Gallery</h1>
            </div>

            {/* <input type={"file"} /> */}
          </div>
        }
      />
      <Route path="photo" element={<div>404 Page Not Found</div>} />
      <Route path="album" element={<div>404 Page Not Found</div>} />
      <Route path="gallery" element={<div>404 Page Not Found</div>} />
      <Route path="*" element={<div>404 Page Not Found</div>} />
    </Routes>
  );
};

export default SubmitPage;
