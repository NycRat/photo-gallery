import ImageSize from "../Models/ImageSize";

const Image = (props: { src: string; size: ImageSize }): JSX.Element => {
  return (
    <img
      className={"img " + props.size}
      src={`data:image/jpeg;base64,${props.src}`}
      alt="temp"
    />
  );
};

export default Image;
