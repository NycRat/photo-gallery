const Photo = (props: {src: string}): JSX.Element => {
  return <img src={props.src} alt="temp" />;
};

export default Photo;
