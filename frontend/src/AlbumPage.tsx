import { useState } from "react";
import Photo from "./Components/PhotoPreview";
import {AlbumProps} from "./Models/AlbumProps";

const AlbumPage = (props: AlbumProps): JSX.Element => {
  const [photos, setPhotos] = useState<string[]>(props.photos);

  return (
    <div className="album-page">
      <h1>{props.name}</h1>

      {props.photos.map((photo, i) => {
        return <Photo key={i} src={photo} />;
      })}
    </div>
  );
};

export default AlbumPage;
