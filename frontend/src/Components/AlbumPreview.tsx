import { useNavigate, useParams } from "react-router-dom";
import { AlbumProps } from "../Models/AlbumProps";
import ImageSize from "../Models/ImageSize";
import Image from "./Image";

const AlbumPreview = (props: AlbumProps): JSX.Element => {
  const navigate = useNavigate();

  const {galleryName} = useParams();

  return (
    <div
      className="album-preview"
      onClick={() => {
        navigate(`/gallery/${galleryName}/album/${props.name}`);
      }}
    >
      <h1>{props.name}</h1>
      {props.images.length !== 0 && <Image src={props.images[0]} size={ImageSize.x} />}
    </div>
  );
};

export default AlbumPreview;
