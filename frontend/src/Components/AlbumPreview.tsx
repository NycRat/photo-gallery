import { useNavigate } from "react-router-dom";
import { AlbumProps } from "../Models/AlbumProps";
import ImageSize from "../Models/ImageSize";
import Image from "./Image";

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
      {props.images.length !== 0 && <Image src={props.images[0]} size={ImageSize.x} />}
    </div>
  );
};

export default AlbumPreview;
