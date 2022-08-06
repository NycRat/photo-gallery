import { useCallback, useEffect, useRef, useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import AlbumPage from "./AlbumPage";
import { getAlbumImage, getAlbumLength, getAlbumList } from "./Api/AlbumApi";
import MainPage from "./MainPage";
import { AlbumProps } from "./Models/AlbumProps";
import ImageSize from "./Models/ImageSize";
import NotFoundPage from "./NotFoundPage";

const App = (): JSX.Element => {
  const [albumPreviews, setAlbumPreviews] = useState<AlbumProps[]>([]);
  const previewIndices = useRef<number[]>([]);
  const [albumList, setAlbumList] = useState<string[]>([]);

  useEffect(() => {
    const getAlbums = async () => {
      const albumList = await getAlbumList();
      setAlbumList(albumList);
    };
    getAlbums();
  }, []);

  const pushPreview = useCallback( async (imageSize: ImageSize, index: number) => {
    const albumPreview = {
      name: albumList[index],
      images: [
        await getAlbumImage(
          albumList[index],
          previewIndices.current[index],
          imageSize
        ),
      ],
    };
    setAlbumPreviews([...albumPreviews, albumPreview]);
  }, [albumList, albumPreviews]);

  useEffect(() => {
    if (previewIndices.current.length >= albumList.length) {
      return;
    }
    const pushPreviewAndIndex = async () => {
      // we dont put together because of somethign will implement later
      previewIndices.current.push(
        Math.floor(
          Math.random() *
            (await getAlbumLength(albumList[previewIndices.current.length]))
        )
      );
      pushPreview("s", previewIndices.current.length-1);
    };
    setTimeout(() => {
      pushPreviewAndIndex();
    }, 200);
  }, [albumList, albumPreviews, pushPreview]);

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
