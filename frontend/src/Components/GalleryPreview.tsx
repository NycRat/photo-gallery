import {useNavigate} from "react-router-dom";

const GalleryPreview = (props: {name: string}): JSX.Element => {
  const navigate = useNavigate();

  return <div onClick={() => navigate(`/gallery/${props.name}`)}>{props.name}</div>;
};

export default GalleryPreview;
