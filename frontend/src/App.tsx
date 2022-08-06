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
  const [loadedXs, setLoadedXs] = useState<boolean>(false);
  const previewIndices = useRef<number[]>([]);
  const loadingIndex = useRef<number>(0);
  const [albumList, setAlbumList] = useState<string[]>([]);

  useEffect(() => {
    const getAlbums = async () => {
      const albumList = await getAlbumList();
      for (let i = 0; i < albumList.length; i++) {
        previewIndices.current.push(
          Math.floor(
            Math.random() *
              (await getAlbumLength(albumList[previewIndices.current.length]))
          )
        );
      }
      setAlbumList(albumList);
    };
    getAlbums();
  }, []);

  const pushPreview = useCallback( async (imageSize: ImageSize) => {
    let index = loadingIndex.current;
    if (albumList.length === 0) {
      return;
    }
    if (index >= albumList.length) {
      if (!loadedXs) {
        setLoadedXs(true);
        loadingIndex.current = 0;
      }
      return;
    }
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
    if (index < albumPreviews.length) {
      let newAlbumPreviews = [...albumPreviews];
      newAlbumPreviews[index] = albumPreview;
      setAlbumPreviews(newAlbumPreviews);
    } else {
      setAlbumPreviews([...albumPreviews, albumPreview]);
    }
    loadingIndex.current++;
  }, [albumList, albumPreviews, loadedXs]);

  useEffect(() => {
    if (loadedXs) {
      return;
    }
    pushPreview("xs");
  }, [loadedXs, pushPreview]);

  useEffect(() => {
    if (!loadedXs) {
      return;
    }
    pushPreview("s");
  }, [loadedXs, pushPreview]);

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
