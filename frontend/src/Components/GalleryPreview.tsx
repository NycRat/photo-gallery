import { useNavigate } from "react-router-dom";
import ImageSize from "../Models/ImageSize";
import Image from "./Image";

const GalleryPreview = (props: {
  name: string;
  image: string | undefined;
}): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div
      className="gallery-preview"
      onClick={() => navigate(`/gallery/${props.name}`)}
    >
      <h1>{props.name}</h1>

      {props.image !== undefined && (
        <Image size={ImageSize.s} src={props.image} />
      )}
    </div>
  );
};

export default GalleryPreview;
