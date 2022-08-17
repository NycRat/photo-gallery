import { useEffect, useState } from "react";
import { apiPostPhoto } from "../Api/ApiFunctions";

const SubmitImagePopup = (props: {
  gallery: string;
  album: string;
  onExit: () => void;
}): JSX.Element => {
  const [photoDataArr, setPhotoDataArr] = useState<Uint8Array[]>([]);
  const [previewData, setPreviewData] = useState<string>("");
  const [postingPhotos, setPostingPhotos] = useState<boolean>(false);

  const updateFile = async (event: any) => {
    let previewFile = event.target.files[0];
    let previewReader = new FileReader();
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

    if (previewFile) {
      previewReader.readAsDataURL(previewFile);
    }

    let reader = new FileReader();
    let dataArr: Uint8Array[] = [];
    let index = 0;

    reader.onload = () => {
      if (reader.result) {
        let arrBuf = reader.result;
        if (typeof arrBuf === "object") {
          dataArr.push(new Uint8Array(arrBuf));
        }
        index++;
        if (index < event.target.files.length) {
          reader.readAsArrayBuffer(event.target.files[index]);
        }
      }
    };
    reader.onerror = () => {
      alert(reader.error);
    };
    reader.readAsArrayBuffer(previewFile);

    setPhotoDataArr(dataArr);
  };

  useEffect(() => {
    console.log(photoDataArr);
  }, [photoDataArr]);

  return (
    <div className="woah">
      <div className="popup">
        <div className="exit-button" onClick={props.onExit}>
          Close
        </div>
        <input
          type={"file"}
          onChange={updateFile}
          accept={".jpeg,.jpg"}
          multiple={true}
        />
        <br />
        <button
          onClick={async () => {
            setPostingPhotos(true);
            if (photoDataArr.length === 1) {
              alert("Adding 1 Photo to Album");
            } else {
              alert(`Adding ${photoDataArr.length} Photos to Album`);
            }
            for (let data of photoDataArr) {
              await apiPostPhoto(data, props.gallery, props.album);
            }
            setPostingPhotos(false);
            window.location.reload();
          }}
          disabled={photoDataArr.length === 0 || postingPhotos}
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
