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
  const [albumList, setAlbumList] = useState<string[]>([]);
  const [loadedXs, setLoadedXs] = useState<boolean>(false);
  const previewIndices = useRef<number[]>([]);
  const loadIndex = useRef<number>(0);

  useEffect(() => {
    const getAlbums = async () => {
      const albumList = await getAlbumList();
      for (let i = 0; i < albumList.length; i++) {
        previewIndices.current.push(
          Math.floor(Math.random() * await getAlbumLength(albumList[i]))
        );
      }
      console.log(previewIndices.current);
      setAlbumList(albumList);
    };
    getAlbums();
  }, []);

  const fetchPreview = useCallback( async (imageSize: ImageSize) => {
    let index = loadIndex.current;
    if (albumList.length === 0) {
      return;
    }
    if (index >= albumList.length) {
      if (!loadedXs) {
        setLoadedXs(true);
        loadIndex.current = 0;
        return;
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
    if (index < albumList.length) {
      let newAlbumPreviews = [...albumPreviews];
      newAlbumPreviews[index] = albumPreview;
      setAlbumPreviews(newAlbumPreviews);
    } else {
      setAlbumPreviews([...albumPreviews, albumPreview]);
    }
    loadIndex.current++;
  }, [albumList, albumPreviews, loadedXs]);

  useEffect(() => {
    if (!loadedXs) {
      fetchPreview("xs");
    }
  }, [fetchPreview, loadedXs, albumList]);

  useEffect(() => {
    if (loadedXs) {
      fetchPreview("s");
    }
  }, [fetchPreview, loadedXs, albumList]);

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
