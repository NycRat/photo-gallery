import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  apiGetImage,
  apiGetAlbumLength,
  apiDeletePhoto,
} from "../Api/ApiFunctions";
import Image from "../Components/Image";
import SubmitImagePopup from "../Components/SubmitImagePopup";
import ImageSize from "../Models/ImageSize";
import NewPhoto from "../new_photo_icon.svg";

const AlbumPage = (props: { hasAdminAccess: boolean }): JSX.Element => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [albumLength, setAlbumLength] = useState<number>(0);
  const [loadedX, setLoadedX] = useState<boolean>(false);
  const [loadIndex, setLoadIndex] = useState<number>(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [selectedNewImage, setSelectedNewImage] = useState<boolean>(false);
  const loadedMsList = useRef(new Set());

  const { galleryName, albumName } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    if (!albumName || !galleryName) {
      return;
    }
    setImages([]);
    setIsLoading(true);
    setAlbumLength(0);
    setLoadedX(false);
    setLoadIndex(0);
    setSelectedImageIndex(-1);
    loadedMsList.current = new Set();

    const getAlbumLen = async () => {
      let len = await apiGetAlbumLength(galleryName, albumName);
      setAlbumLength(len);
      setIsLoading(false);
    };
    getAlbumLen();
  }, [albumName, galleryName]);

  useEffect(() => {
    if (albumLength === 0 || !galleryName || !albumName) {
      return;
    }
    const fetchPhoto = async () => {
      if (loadIndex >= albumLength) {
        if (!loadedX) {
          setLoadIndex(0);
          setLoadedX(true);
        }
        return;
      }
      const imageSize = !loadedX ? ImageSize.x : ImageSize.s;

      const image = await apiGetImage(
        galleryName,
        albumName,
        loadIndex,
        imageSize
      );
      if (loadIndex < albumLength) {
        let newImages = [...images];
        newImages[loadIndex] = image;
        setImages(newImages);
      } else {
        setImages([...images, image]);
      }
      setLoadIndex(loadIndex + 1);
    };

    fetchPhoto();
  }, [albumLength, albumName, galleryName, images, loadIndex, loadedX]);

  useEffect(() => {
    if (albumLength === 0 || !galleryName || !albumName) {
      return;
    }
    if (selectedImageIndex >= 0 && selectedImageIndex < images.length) {
      if (loadedMsList.current.has(selectedImageIndex)) {
        return;
      } else {
        loadedMsList.current.add(selectedImageIndex);
      }
      const fetchPhoto = async () => {
        const image = await apiGetImage(
          galleryName,
          albumName,
          selectedImageIndex,
          ImageSize.m
        );
        let newImages = [...images];
        newImages[selectedImageIndex] = image;
        setImages(newImages);
      };

      fetchPhoto();
    }
  }, [
    albumLength,
    albumName,
    galleryName,
    images,
    loadIndex,
    loadedMsList,
    selectedImageIndex,
  ]);

  const handleClickBackButton = () => {
    if (galleryName) {
      if (galleryName === "imageDB") {
        navigate(`/`);
        return;
      }
    }
    navigate(`/gallery/${galleryName}`);
  };

  if (!galleryName || !albumName) {
    return <h1>404 Album Not Found</h1>;
  }

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
          <button className="back-button" onClick={handleClickBackButton}>
            Back
          </button>
        )
      }
      {isLoading ? (
        <h1>Loading ...</h1>
      ) : albumLength !== 0 ? (
        selectedImageIndex >= 0 && selectedImageIndex < images.length ? (
          <div>
            <div className="nav-cover" />
            <Image
              key={selectedImageIndex}
              src={images[selectedImageIndex]}
              size={ImageSize.m}
            />
            <button
              className="back-button"
              onClick={() => setSelectedImageIndex(-1)}
            >
              {"Back"}
            </button>
            {props.hasAdminAccess && (
              <button
                className="delete-button"
                onClick={async () => {
                  await apiDeletePhoto(
                    galleryName,
                    albumName,
                    selectedImageIndex
                  );
                  let newImages = [...images];
                  newImages.splice(selectedImageIndex, 1);
                  setImages(newImages);
                  setSelectedImageIndex(-1);
                }}
              >
                Delete
              </button>
            )}
          </div>
        ) : (
          <div>
            {galleryName === "imageDB" ? (
              <h1>Images</h1>
            ) : (
              <h1 className="title">{albumName}</h1>
            )}

            {images.map((photo, i) => (
              <Image
                key={i}
                src={photo}
                size={ImageSize.s}
                onClick={() => {
                  if (loadedX && loadIndex >= albumLength) {
                    setSelectedImageIndex(i);
                  }
                }}
              />
            ))}
            {props.hasAdminAccess && (
              <img
                className="new-image"
                src={NewPhoto}
                alt="new"
                onClick={() => setSelectedNewImage(true)}
              />
            )}
            {selectedNewImage && (
              <SubmitImagePopup
                gallery={galleryName}
                album={albumName}
                onExit={() => setSelectedNewImage(false)}
              />
            )}
          </div>
        )
      ) : (
        <h1>404 Album Not Found</h1>
      )}
    </div>
  );
};

export default AlbumPage;
