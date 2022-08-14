import AlbumPreview from "../Components/AlbumPreview";
import { useCallback, useEffect, useRef, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import AlbumPage from "./AlbumPage";
import {
  apiGetAlbumImage,
  apiGetAlbumLength,
  apiGetAlbumList,
} from "../Api/AlbumApi";
import { AlbumProps } from "../Models/AlbumProps";
import ImageSize from "../Models/ImageSize";

const GalleryPage = (): JSX.Element => {
  const [albumPreviews, setAlbumPreviews] = useState<AlbumProps[]>([]);
  const [albumList, setAlbumList] = useState<string[]>([]);
  const [loadedX, setLoadedX] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const previewIndices = useRef<number[]>([]);
  const loadIndex = useRef<number>(0);

  const { galleryName } = useParams(); // TODO - fix bug where updating url doesnt update galleryName
  const navigate = useNavigate();

  useEffect(() => {
    if (!galleryName) {
      return;
    }
    const getAlbums = async () => {
      const albumList = await apiGetAlbumList(galleryName);
      setIsLoading(false);
      for (let i = 0; i < albumList.length; i++) {
        previewIndices.current.push(
          Math.floor(
            Math.random() * (await apiGetAlbumLength(galleryName, albumList[i]))
          )
        );
      }
      setAlbumList(albumList);
    };
    getAlbums();
  }, [galleryName]);

  const fetchPreview = useCallback(
    async (imageSize: ImageSize) => {
      if (!galleryName) {
        return;
      }
      let index = loadIndex.current;
      if (albumList.length === 0) {
        return;
      }
      if (index >= albumList.length) {
        if (!loadedX) {
          setLoadedX(true);
          loadIndex.current = 0;
          return;
        }
        return;
      }
      const albumPreview = {
        name: albumList[index],
        images: [
          await apiGetAlbumImage(
            galleryName,
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
    },
    [albumList, albumPreviews, galleryName, loadedX]
  );

  useEffect(() => {
    if (!loadedX) {
      fetchPreview(ImageSize.x);
    }
  }, [fetchPreview, loadedX, albumList]);

  useEffect(() => {
    if (loadedX) {
      fetchPreview(ImageSize.s);
    }
  }, [fetchPreview, loadedX, albumList]);
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div>
            <button className="back-button" onClick={() => navigate(`/`)}>
              Back
            </button>
            {isLoading ? (
              <h1>Loading ...</h1>
            ) : (
              <div>
                <h1 className="title">{galleryName}</h1>
                {albumPreviews.map((album, i) => (
                  <AlbumPreview key={i} {...album} />
                ))}
              </div>
            )}
          </div>
        }
      />
      <Route path="/album/:albumName" element={<AlbumPage />} />
      <Route path="*" element={<div>404 Page Not Found</div>} />
    </Routes>
  );
};

export default GalleryPage;
