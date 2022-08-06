import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAlbumImage, getAlbumLength } from "./Api/AlbumApi";
import Image from "./Components/Image";
import ImageSize from "./Models/ImageSize";

const AlbumPage = (): JSX.Element => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [albumLength, setAlbumLength] = useState<number>(0);
  const [loadedXs, setLoadedXs] = useState<boolean>(false);
  const loadIndex = useRef<number>(0);

  const { albumName } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    console.log("AES");
    if (!albumName) {
      return;
    }
    const getAlbumLen = async () => {
      setAlbumLength(await getAlbumLength(albumName));
      setIsLoading(false);
    }
    getAlbumLen();
  }, [albumName]);

  const fetchPhoto = useCallback(async (imageSize: ImageSize) => {
    if (!albumName || albumLength === 0) {
      return;
    }
    if (loadIndex.current >= albumLength) {
      if (!loadedXs) {
        setLoadedXs(true);
        loadIndex.current = 0;
        return;
      }
      return;
    }

    let image = await getAlbumImage(albumName, loadIndex.current, imageSize);
    if (loadIndex.current < images.length) {
      let newImages = [...images];
      newImages[loadIndex.current] = image;
      setImages(newImages);
    } else {
      setImages([...images, image]);
    }
    loadIndex.current++;
  }, [albumLength, albumName, images, loadedXs]);

  useEffect(() => {
    if (!loadedXs) {
      fetchPhoto("xs");
    }
  }, [fetchPhoto, loadedXs]);

  useEffect(() => {
    if (loadedXs) {
      fetchPhoto("s");
    }
  }, [fetchPhoto, loadedXs]);

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
      ) : albumLength !== 0 ? (
        <div>
          <h1>{albumName}</h1>
          {images.map((photo, i) => (
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
