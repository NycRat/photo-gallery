import AlbumPreview from "../Components/AlbumPreview";
import { useEffect, useRef, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import AlbumPage from "./AlbumPage";
import {
  apiGetImage,
  apiGetAlbumLength,
  apiGetAlbumList,
  apiGetHasAdminAccess,
  apiPostAlbum,
} from "../Api/ApiFunctions";
import { AlbumProps } from "../Models/AlbumProps";
import ImageSize from "../Models/ImageSize";

const GalleryPage = (): JSX.Element => {
  const [albumPreviews, setAlbumPreviews] = useState<AlbumProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadedX, setLoadedX] = useState<boolean>(false);
  const previewIndices = useRef<number[]>([]);
  const loadIndex = useRef<number>(0);
  const [hasAdminAccess, setHasAdminAccess] = useState<boolean>(false);
  const [gallery, setGallery] = useState<string>("");

  const [newAlbumInput, setNewAlbumInput] = useState<string>("");

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
    if (!galleryName) {
      return;
    }

    setAlbumPreviews([]);
    setIsLoading(true);
    setLoadedX(false);
    previewIndices.current = [];
    loadIndex.current = 0;

    const getAlbums = async () => {
      let albumList = await apiGetAlbumList(galleryName);
      setGallery(galleryName);
      setIsLoading(false);

      let albumPreviews: AlbumProps[] = [];
      for (let album of albumList) {
        albumPreviews.push({ name: album, images: [] });
      }
      setAlbumPreviews(albumPreviews);
    };
    getAlbums();
  }, [galleryName]);

  useEffect(() => {
    if (!gallery || albumPreviews.length === 0) {
      return;
    }

    const fetchPreview = async () => {
      let index = loadIndex.current;
      if (index >= albumPreviews.length) {
        if (!loadedX) {
          setLoadedX(true);
          loadIndex.current = 0;
        }
        return;
      }
      const imageSize = !loadedX ? ImageSize.x : ImageSize.s;

      if (!loadedX) {
        previewIndices.current.push(
          Math.floor(
            Math.random() *
              (await apiGetAlbumLength(
                gallery,
                albumPreviews[loadIndex.current].name
              ))
          )
        );
      }

      const albumPreview = {
        name: albumPreviews[index].name,
        images: [
          await apiGetImage(
            gallery,
            albumPreviews[index].name,
            previewIndices.current[index],
            imageSize
          ),
        ],
      };
      let newAlbumPreviews = [...albumPreviews];
      newAlbumPreviews[index] = albumPreview;
      setAlbumPreviews(newAlbumPreviews);
      loadIndex.current++;
    };

    fetchPreview();
  }, [loadedX, albumPreviews, gallery]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newAlbumInput.trim() === "") {
      return;
    }
    await apiPostAlbum(gallery, newAlbumInput);
    window.location.reload();
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div>
            <span className="back-button" onClick={() => navigate(`/`)}>
              <p className="text">Back</p>
            </span>
            {isLoading ? (
              <h1>Loading ...</h1>
            ) : albumPreviews.length !== 0 ? (
              <div>
                <h1 className="title">{galleryName}</h1>
                {albumPreviews.map((album, i) => (
                  <AlbumPreview key={i} {...album} />
                ))}
                {hasAdminAccess && (
                  <div>
                    <h1>New Album</h1>
                    <form onSubmit={handleSubmit}>
                      <input
                        type={"text"}
                        value={newAlbumInput}
                        onChange={(e) => {
                          setNewAlbumInput(e.currentTarget.value);
                        }}
                      />
                      <input
                        type={"submit"}
                        value={"Create Album"}
                        disabled={newAlbumInput === ""}
                      />
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <h1>404 Gallery Not Found</h1>
            )}
          </div>
        }
      />
      <Route
        path="/album/:albumName/*"
        element={<AlbumPage hasAdminAccess={hasAdminAccess} />}
      />
      <Route path="*" element={<div>404 Page Not Found</div>} />
    </Routes>
  );
};

export default GalleryPage;
