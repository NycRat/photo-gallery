import { useEffect, useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import AlbumPage from "./AlbumPage";
import { getAlbumImage, getAlbumLength, getAlbumList } from "./Api/AlbumApi";
import MainPage from "./MainPage";
import { AlbumProps } from "./Models/AlbumProps";
import NotFoundPage from "./NotFoundPage";

const App = (): JSX.Element => {
  // const [photoAlbums, setPhotoAlbums] = useState<AlbumProps[]>([]);
  const [albumPreviews, setAlbumPreviews] = useState<AlbumProps[]>([]);

  useEffect(() => {
    let getAlbumPreviews = async () => {
      let newAlbumPreviews: AlbumProps[] = [];
      const albumList = await getAlbumList();
      for (let i = 0; i < albumList.length; i++) {
        // let album_images: string[] = [];
        // for (let j = 0; j < await getAlbumLength(albumList[i]); j++) {
        //   album_images.push(await getAlbumImage(albumList[i], j, "s"));
        // }
        newAlbumPreviews.push({
          name: albumList[i],
          images: [
            await getAlbumImage(
              albumList[i],
              Math.floor(Math.random() * (await getAlbumLength(albumList[i]))),
              "s"
            ),
          ],
        });
      }
      setAlbumPreviews(newAlbumPreviews);
    };

    getAlbumPreviews();
  }, []);

  return (
    <div className="app">
      <HashRouter>
        <Routes>
          <Route path="/" element={<MainPage photoAlbums={albumPreviews} />} />
          <Route path="/album/:albumName" element={<AlbumPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </HashRouter>
    </div>
  );
};
export default App;
