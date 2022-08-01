import Photo from "./Photo";

export interface AlbumProps {
  name: string;
  photos: string[];
};

const Album = (props: AlbumProps): JSX.Element => {

  return (
    <div className="album" onClick={() => {

    }}>
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

export default Album;
