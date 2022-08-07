import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAlbumImage, getAlbumLength } from "./Api/AlbumApi";
import Image from "./Components/Image";
import ImageSize from "./Models/ImageSize";

const AlbumPage = (): JSX.Element => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [albumLength, setAlbumLength] = useState<number>(0);
  const [loadedX, setLoadedX] = useState<boolean>(false);
  const loadIndex = useRef<number>(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);

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
    };
    getAlbumLen();
  }, [albumName]);

  const fetchPhoto = useCallback(
    async (imageSize: ImageSize) => {
      if (!albumName || albumLength === 0) {
        return;
      }
      if (loadIndex.current >= albumLength) {
        if (!loadedX) {
          setLoadedX(true);
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
    },
    [albumLength, albumName, images, loadedX]
  );

  useEffect(() => {
    if (!loadedX) {
      fetchPhoto("x");
    }
  }, [fetchPhoto, loadedX]);

  useEffect(() => {
    if (loadedX) {
      fetchPhoto("s");
    }
  }, [fetchPhoto, loadedX]);

  return (
    <div className="album-page">
      {
        // this is the most cancer code i have seen
        !(
          !isLoading &&
          selectedImageIndex >= 0 &&
          selectedImageIndex < images.length &&
          albumLength !== 0
        ) && (
          <button
            className="back-button"
            onClick={() => {
              navigate("/");
            }}
          >
            {"Gallery"}
          </button>
        )
      }
      {isLoading ? (
        <h1>Loading ...</h1>
      ) : albumLength !== 0 ? (
        selectedImageIndex >= 0 && selectedImageIndex < images.length ? (
          <div>
            <button
              className="back-button"
              onClick={() => {
                setSelectedImageIndex(-1);
              }}
            >
              {"Back"}
            </button>
            <Image
              key={selectedImageIndex}
              src={images[selectedImageIndex]}
              size={"l"}
            />
          </div>
        ) : (
          <div>
            <h1>{albumName}</h1>
            {images.map((photo, i) => (
              <Image
                key={i}
                src={photo}
                size={"s"}
                onClick={() => setSelectedImageIndex(i)}
              />
            ))}
          </div>
        )
      ) : (
        <h1>404 Album Not Found</h1>
      )}
    </div>
  );
};

export default AlbumPage;
