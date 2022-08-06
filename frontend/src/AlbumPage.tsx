import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAlbumImage, getAlbumLength } from "./Api/AlbumApi";
import Image from "./Components/Image";
import ImageSize from "./Models/ImageSize";

const AlbumPage = (): JSX.Element => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [albumLength, setAlbumLength] = useState<number>(0);
  const [loadedXs, setLoadedXs] = useState<boolean>(false);
  const loadingIndex = useRef<number>(0);

  const { albumName } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    const getLen = async () => {
      if (!albumName) {
        setIsLoading(false);
        return;
      }
      setAlbumLength(await getAlbumLength(albumName));
    };
    getLen();
  }, [albumName]);

  const fetchImage = useCallback(
    async (imageSize: ImageSize) => {
      if (!albumName || albumLength === 0) {
        setIsLoading(false);
        return;
      }

      if (loadingIndex.current >= albumLength) {
        if (!loadedXs) {
          setLoadedXs(true);
          loadingIndex.current = 0;
        }
        setIsLoading(false);
        return;
      }

      const image = await getAlbumImage(
        albumName,
        loadingIndex.current,
        imageSize
      );
      if (loadingIndex.current < photos.length) {
        let newPhotos = [...photos];
        newPhotos[loadingIndex.current] = image;
        setPhotos(newPhotos);
      } else {
        setPhotos([...photos, image]);
      }
      loadingIndex.current++;
      setIsLoading(false);
    },
    [photos, albumName, albumLength, loadedXs]
  );

  useEffect(() => {
    if (loadedXs) {
      return;
    }
    fetchImage("xs");
  }, [fetchImage, loadedXs]);

  useEffect(() => {
    if (!loadedXs) {
      return;
    }
    fetchImage("s");
  }, [fetchImage, loadedXs]);

  return (
    <div className="album-page">
      <button
        className="back-button"
        onClick={() => {
          navigate("/");
        }}
      >
        {"Gallery"}
      </button>
      {isLoading ? (
        <h1>Loading ...</h1>
      ) : photos.length !== 0 ? (
        <div>
          <h1>{albumName}</h1>
          {photos.map((photo, i) => (
            <Image key={i} src={photo} size={"s"} />
          ))}
        </div>
      ) : (
        <h1>404 Album Not Found</h1>
      )}
    </div>
  );
};

export default AlbumPage;
