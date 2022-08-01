import { useNavigate } from "react-router-dom";
import {AlbumProps} from "../Models/AlbumProps";
import Photo from "./PhotoPreview";

const AlbumPreview = (props: AlbumProps): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div
      className="album"
      onClick={() => {
        navigate("/album/" + props.name);
      }}
    >
      <h1>{props.name}</h1>
      {props.photos.length !== 0 && (
        <Photo
          // random photo from album
          src={props.photos[Math.floor(Math.random() * props.photos.length)]}
        />
      )}
    </div>
  );
};

export default AlbumPreview;
