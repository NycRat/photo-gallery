import { useEffect, useState } from "react";
import Album from "./Components/Album";
import {AlbumProps} from "./Components/Album";

const App = (): JSX.Element => {
  const [photoAlbums, setPhotoAlbums] = useState<AlbumProps[]>([]);

  useEffect(() => {
    let defaultPhotoAlbums: AlbumProps[] = [
      {
        name: "Album 1",
        photos: [
          "https://picsum.photos/200/300/?random",
          "https://picsum.photos/200/300/?random",
          "https://picsum.photos/200/300/?random",
          "https://picsum.photos/200/300/?random",
          "https://picsum.photos/200/300/?random",
          "https://picsum.photos/200/300/?random",
          ]
      },
      {
        name: "Album 2",
        photos: [
          "https://picsum.photos/200/300/?random",
          "https://picsum.photos/200/300/?random",
          "https://picsum.photos/200/300/?random",
          "https://picsum.photos/200/300/?random",
          ]
      },
    ]
    setPhotoAlbums(defaultPhotoAlbums);
  } , []);

  return (
    <div className="app">
      <h1 className="app-title">Photo Gallery</h1>
      {photoAlbums.map((album, i) => (
        <Album key={i} {...album} />
      ))}
    </div>
  );
};

export default App;
