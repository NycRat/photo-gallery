import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAlbumImage, getAlbumLength } from "./Api/AlbumApi";
import Image from "./Components/Image";
import ImageSize from "./Models/ImageSize";

const AlbumPage = (): JSX.Element => {
  const [images, setImages] = useState<{ data: string; size: ImageSize }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [albumLength, setAlbumLength] = useState<number>(0);
  const [loadedX, setLoadedX] = useState<boolean>(false);
  const [loadIndex, setLoadIndex] = useState<number>(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);

  const { galleryName, albumName } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
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
    async (index: number, imageSize: ImageSize, incLoadIndex: boolean) => {
      if (!albumName || albumLength === 0) {
        return;
      }
      if (incLoadIndex) {
        if (loadIndex >= albumLength) {
          if (!loadedX) {
            setLoadedX(true);
            setLoadIndex(0);
          }
          return;
        }
      }

      let image = await getAlbumImage(albumName, index, imageSize);
      if (index < images.length) {
        if (images[index].size >= imageSize) {
          if (incLoadIndex) {
            setLoadIndex(loadIndex + 1);
          }
          return;
        }
        let newImages = [...images];
        newImages[index] = { data: image, size: imageSize };
        setImages(newImages);
      } else {
        setImages([...images, { data: image, size: imageSize }]);
      }

      if (incLoadIndex) {
        setLoadIndex(loadIndex + 1);
      }
    },
    [albumLength, albumName, images, loadIndex, loadedX]
  );

  useEffect(() => {
    if (!loadedX) {
      fetchPhoto(loadIndex, ImageSize.x, true);
    }
  }, [fetchPhoto, images.length, loadIndex, loadedX, selectedImageIndex]);

  useEffect(() => {
    if (loadedX) {
      fetchPhoto(loadIndex, ImageSize.s, true);
    }
  }, [fetchPhoto, images.length, loadIndex, loadedX, selectedImageIndex]);

  useEffect(() => {
    if (selectedImageIndex >= 0 && selectedImageIndex < images.length) {
      fetchPhoto(selectedImageIndex, ImageSize.m, false);
    }
  }, [fetchPhoto, images.length, selectedImageIndex]);

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
              navigate(`/gallery/${galleryName}`);
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
              onClick={() => setSelectedImageIndex(-1)}
            >
              {"Back"}
            </button>
            <Image
              key={selectedImageIndex}
              src={images[selectedImageIndex].data}
              size={ImageSize.m}
            />
          </div>
        ) : (
          <div>
            <h1>{albumName}</h1>
            {images.map((photo, i) => (
              <Image
                key={i}
                src={photo.data}
                size={ImageSize.s}
                onClick={() => {
                  if (loadedX && loadIndex >= albumLength) {
                    setSelectedImageIndex(i);
                  }
                }}
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
