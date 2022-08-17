import { useState } from "react";
import { apiPostPhoto } from "../Api/ApiFunctions";

const SubmitImagePopup = (props: {
  gallery: string;
  album: string;
  onExit: () => void;
}): JSX.Element => {
  const [photoData, setPhotoData] = useState<Uint8Array>(new Uint8Array());
  const [previewData, setPreviewData] = useState<string>("");

  const updateFile = (event: any) => {
    let file = event.target.files[0];

    let reader = new FileReader();
    let previewReader = new FileReader();

    reader.onload = () => {
      if (reader.result) {
        let arrBuf = reader.result;
        if (typeof arrBuf === "object") {
          let stuff = new Uint8Array(arrBuf);
          setPhotoData(stuff);
        }
      }
    };

    reader.onerror = () => {
      alert(reader.error);
    };

    previewReader.onload = () => {
      if (previewReader.result) {
        let previewStr = previewReader.result;
        if (typeof previewStr === "string") {
          setPreviewData(previewStr);
        }
      }
    };

    previewReader.onerror = () => {
      alert(previewReader.error);
    };

    if (file) {
      previewReader.readAsDataURL(file);
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="woah">
      <div className="popup">
        <div className="exit-button" onClick={props.onExit}>
          Close
        </div>
        <input type={"file"} onChange={updateFile} accept={".jpeg,.jpg"} />
        <br />
        <button
          onClick={async () => {
            await apiPostPhoto(photoData, props.gallery, props.album)
            window.location.reload();
          }}
        >
          SUBMIT PHOTO
        </button>
        <br />
        {previewData && (
          <img className="image" src={previewData} alt="preview" />
        )}
      </div>
    </div>
  );
};

export default SubmitImagePopup;
