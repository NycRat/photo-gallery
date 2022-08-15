import { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { apiPostPhotoSubmission } from "../Api/ApiFunctions";
import Image from "../Components/Image";
import ImageSize from "../Models/ImageSize";

const SubmitPage = (): JSX.Element => {
  const navigate = useNavigate();

  const [photoData, setPhotoData] = useState<Uint8Array>(new Uint8Array());

  const showFile = (event: any) => {
    let file = event.target.files[0];

    let reader = new FileReader();

    reader.onload = () => {
      if (reader.result) {
        let ase = reader.result;
        if (typeof(ase) === "object") {
          let stuff = new Uint8Array(ase);
          setPhotoData(stuff);
        }
      }
    };
    reader.onerror = () => {
      alert(reader.error);
    };
    if (file) {
      // reader.readAsBinaryString(file);
      reader.readAsArrayBuffer(file);
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
            <button onClick={() => apiPostPhotoSubmission(photoData)}>SUBMIT PHOTO</button>
            {/* {photoData && <Image src={photoData} size={ImageSize.s} />} */}
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
