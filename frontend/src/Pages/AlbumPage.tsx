import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  apiGetImage,
  apiGetAlbumLength,
  apiDeletePhoto,
  apiDeleteAlbum,
} from "../Api/ApiFunctions";
import Image from "../Components/Image";
import SubmitImagePopup from "../Components/SubmitImagePopup";
import ImageSize from "../Models/ImageSize";
import NewPhoto from "../new_photo_icon.svg";
import ImagePage from "./ImagePage";

const AlbumPage = (props: { hasAdminAccess: boolean }): JSX.Element => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [albumLength, setAlbumLength] = useState<number>(-1);
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
    setAlbumLength(-1);
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
    if (albumLength === -1 || !galleryName || !albumName) {
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
    if (albumLength === -1 || !galleryName || !albumName) {
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

  if (!galleryName || !albumName) {
    return <h1>404 Album Not Found</h1>;
  }

  const handleClickBackButton = () => {
    if (galleryName === "imageDB") {
      navigate(`/`);
      return;
    }
    navigate(`/gallery/${galleryName}`);
  };

  const handleDeleteImage = async () => {
    if (!window.confirm("Delete Photo?")) {
      return;
    }

    await apiDeletePhoto(galleryName, albumName, selectedImageIndex);
    let newImages = [...images];
    newImages.splice(selectedImageIndex, 1);
    setImages(newImages);
    setSelectedImageIndex(-1);
  };

  return (
    <div className="album-page">
      {
        // this is the most cancer code i have seen
        !(
          !isLoading &&
          selectedImageIndex >= 0 &&
          selectedImageIndex < images.length &&
          albumLength !== -1
        ) && (
          <div>
            <span className="back-button" onClick={handleClickBackButton}>
              Back
            </span>
          </div>
        )
      }
      {isLoading ? (
        <h1>Loading ...</h1>
      ) : albumLength !== -1 ? (
        selectedImageIndex >= 0 && selectedImageIndex < images.length ? (
          <ImagePage
            src={images[selectedImageIndex]}
            hasAdminAccess={props.hasAdminAccess}
            handleBackButton={() => setSelectedImageIndex(-1)}
            handleImageDelete={handleDeleteImage}
          />
        ) : (
          <div>
            {galleryName === "imageDB" ? (
              <h1>Images</h1>
            ) : (
              <h1 className="title">{albumName}</h1>
            )}
            {props.hasAdminAccess && (
              <span
                className="delete-button"
                onClick={async () => {
                  let promptInput = prompt(
                    `Enter the album name to confirm deletion. (${albumName})`
                  );
                  if (promptInput) {
                    if (promptInput === albumName) {
                      await apiDeleteAlbum(galleryName, albumName);
                      handleClickBackButton();
                      window.location.reload();
                      return;
                    }
                  }
                  alert("Album names did not match.");
                }}
              >
                Delete
              </span>
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
