import ImageSize, {imageSizeToString} from "../Models/ImageSize";

const Image = (props: { src: string; size: ImageSize; onClick?: () => void }): JSX.Element => {
  return (
    <img
      className={"image " + imageSizeToString(props.size)}
      src={`data:image/jpeg;base64,${props.src}`}
      alt="temp"
      onClick={props.onClick}
    />
  );
};

export default Image;
