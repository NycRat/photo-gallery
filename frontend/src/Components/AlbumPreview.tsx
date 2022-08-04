import { useNavigate } from "react-router-dom";
import { AlbumProps } from "../Models/AlbumProps";
import Image from "./Image"

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
        <Image
          src={props.photos[0]}
          size={"s"}
        />
      )}
    </div>
  );
};

export default AlbumPreview;
