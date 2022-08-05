import { useEffect, useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import AlbumPage from "./AlbumPage";
import { getAlbumImage, getAlbumLength, getAlbumList } from "./Api/AlbumApi";
import MainPage from "./MainPage";
import { AlbumProps } from "./Models/AlbumProps";
import NotFoundPage from "./NotFoundPage";

const App = (): JSX.Element => {
  const [albumPreviews, setAlbumPreviews] = useState<AlbumProps[]>([]);

  useEffect(() => {
    let getAlbumPreviews = async () => {
      let newAlbumPreviews: AlbumProps[] = [];
      const albumList = await getAlbumList();
      for (let i = 0; i < albumList.length; i++) {
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
        // setAlbumPreviews(newAlbumPreviews); // doesnt work yet
      }
      setAlbumPreviews(newAlbumPreviews);
    };

    getAlbumPreviews();
  }, []);

  return (
    <div className="app">
      <HashRouter>
        <Routes>
          <Route
            path="/"
            element={<MainPage albumPreviews={albumPreviews} />}
          />
          <Route path="/album/:albumName" element={<AlbumPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </HashRouter>
    </div>
  );
};

export default App;
