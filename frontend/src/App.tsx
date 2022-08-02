import { useEffect, useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import AlbumPage from "./AlbumPage";
import MainPage from "./MainPage";
import { AlbumProps } from "./Models/AlbumProps";
import NotFoundPage from "./NotFoundPage";

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
          <Route path="/album/:albumName" element={<AlbumPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </HashRouter>
    </div>
  );
};

export default App;
