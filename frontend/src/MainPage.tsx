import AlbumPreview from "./Components/AlbumPreview";
import { AlbumProps } from "./Models/AlbumProps";

const MainPage = (props: { photoAlbums: AlbumProps[] }): JSX.Element => {
  return (
    <div>
      <h1 className="app-title">Photo Gallery</h1>
      {props.photoAlbums.map((album, i) => (
        <AlbumPreview key={i} {...album} />
      ))}
    </div>
  );
};

export default MainPage;
