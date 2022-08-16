import AlbumPreview from "../Components/AlbumPreview";
import { useEffect, useRef, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import AlbumPage from "./AlbumPage";
import {
  apiGetImage,
  apiGetAlbumLength,
  apiGetAlbumList,
  apiGetHasAdminAccess,
} from "../Api/ApiFunctions";
import { AlbumProps } from "../Models/AlbumProps";
import ImageSize from "../Models/ImageSize";

const GalleryPage = (): JSX.Element => {
  const [albumPreviews, setAlbumPreviews] = useState<AlbumProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [albumList, setAlbumList] = useState<string[]>([]);
  const [loadedX, setLoadedX] = useState<boolean>(false);
  const previewIndices = useRef<number[]>([]);
  const loadIndex = useRef<number>(0);
  const [hasAdminAccess, setHasAdminAccess] = useState<boolean>(false);
  const [gallery, setGallery] = useState<string>("");

  const { galleryName } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!galleryName) {
      return;
    }
    const fetchAdminAccess = async () => {
      setHasAdminAccess(await apiGetHasAdminAccess(galleryName));
    };
    fetchAdminAccess();
  }, [galleryName]);

  useEffect(() => {
    if (hasAdminAccess) {
      alert("You have admin access to this gallery");
    }
  }, [hasAdminAccess]);

  useEffect(() => {
    if (!galleryName) {
      return;
    }

    setAlbumPreviews([]);
    setIsLoading(true);
    setAlbumList([]);
    setLoadedX(false);
    previewIndices.current = [];
    loadIndex.current = 0;

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
    setGallery(galleryName);
  }, [galleryName]);

  useEffect(() => {
    if (!gallery || albumList.length === 0) {
      return;
    }

    const fetchPreview = async () => {
      let index = loadIndex.current;
      if (index >= albumList.length) {
        if (!loadedX) {
          setLoadedX(true);
          loadIndex.current = 0;
        }
        return;
      }
      const imageSize = !loadedX ? ImageSize.x : ImageSize.s;

      const albumPreview = {
        name: albumList[index],
        images: [
          await apiGetImage(
            gallery,
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
    };

    fetchPreview();
  }, [loadedX, albumList, albumPreviews, gallery]);

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
