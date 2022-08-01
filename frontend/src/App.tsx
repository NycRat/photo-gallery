import { useEffect, useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import AlbumPage from "./AlbumPage";
import MainPage from "./MainPage";
import {AlbumProps} from "./Models/AlbumProps";

const App = (): JSX.Element => {
  const [photoAlbums, setPhotoAlbums] = useState<AlbumProps[]>([]);
  const [curAlbum, setCurAlbum] = useState<string>();

  const getAlbumFromName = (name: string): AlbumProps | undefined => {
    return photoAlbums.find((album) => album.name === name);
  };

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
        ],
      },
      {
        name: "Album 2",
        photos: [
          "https://picsum.photos/200/300/?random",
          "https://picsum.photos/200/300/?random",
          "https://picsum.photos/200/300/?random",
          "https://picsum.photos/200/300/?random",
        ],
      },
    ];
    setPhotoAlbums(defaultPhotoAlbums);
  }, []);

  return (
    <div className="app">
      <HashRouter>
        <Routes>
          <Route path="/" element={<MainPage photoAlbums={photoAlbums} />} />
          <Route
            path="/album/:name"
            element={<AlbumPage {...photoAlbums[0]} />}
          />
        </Routes>
      </HashRouter>
    </div>
  );
};

export default App;
