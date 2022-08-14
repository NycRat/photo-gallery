import { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { apiPostPhotoSubmission } from "../Api/AlbumApi";
import Image from "../Components/Image";
import ImageSize from "../Models/ImageSize";

const SubmitPage = (): JSX.Element => {
  const navigate = useNavigate();

  const [photo, setPhoto] = useState<string>("");

  const showFile = (event: any) => {
    let file = event.target.files[0];

    let reader = new FileReader();

    reader.onload = () => {
      if (reader.result) {
        let data = reader.result.toString();
        data = data.slice(23, data.length); // remove data:image/...
        setPhoto(data);
        apiPostPhotoSubmission(data);
        alert("Submitted Image");
      }
    };
    reader.onerror = () => {
      alert(reader.error);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

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
          </div>
        }
      />
      <Route
        path="photo"
        element={
          <div>
            <input type={"file"} onChange={showFile} accept={".jpeg,.jpg"} />
            <br />
            {photo && <Image src={photo} size={ImageSize.s} />}
          </div>
        }
      />
      <Route path="album" element={<div>404 Page Not Found</div>} />
      <Route path="gallery" element={<div>404 Page Not Found</div>} />
      <Route path="*" element={<div>404 Page Not Found</div>} />
    </Routes>
  );
};

export default SubmitPage;
