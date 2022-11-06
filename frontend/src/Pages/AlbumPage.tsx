import { useEffect, useRef, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
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

const AlbumPage = (props: {
  hasAdminAccess: boolean;
  album?: string;
}): JSX.Element => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [albumLength, setAlbumLength] = useState<number>(0);
  const [loadedX, setLoadedX] = useState<boolean>(false);
  const [loadIndex, setLoadIndex] = useState<number>(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [selectedNewImage, setSelectedNewImage] = useState<boolean>(false);
  const [albumNameS, setAlbumName] = useState<string>("");
  const loadedMsList = useRef(new Set());

  const { galleryName, albumName } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    if (!albumName) {
      if (props.album) {
        setAlbumName(props.album);
        console.log(albumNameS);
      }
    } else {
      setAlbumName(albumName);
    }
    if (!galleryName) {
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
      let len = await apiGetAlbumLength(galleryName, albumNameS);
      setAlbumLength(len);
      setIsLoading(false);

      let images: string[] = [];
      for (let i = 0; i < len; i++) {
        images.push("");
      }
      setImages(images);
    };
    getAlbumLen();
  }, [albumName, albumNameS, galleryName, props.album]);

  useEffect(() => {
    if (albumLength <= 0 || !galleryName || !albumNameS) {
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
        albumNameS,
        loadIndex,
        imageSize
      );
      let newImages = [...images];
      newImages[loadIndex] = image;
      setImages(newImages);

      setLoadIndex(loadIndex + 1);
    };

    fetchPhoto();
  }, [albumLength, albumNameS, galleryName, images, loadIndex, loadedX]);

  useEffect(() => {
    if (albumLength <= 0 || !galleryName || !albumNameS) {
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
          albumNameS,
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
    albumNameS,
    galleryName,
    images,
    loadIndex,
    loadedMsList,
    selectedImageIndex,
  ]);

  if (!galleryName || !albumNameS) {
    return <h1>404 Album Not Found</h1>;
  }

  const handleClickBackButton = () => {
    if (!albumName) {
      navigate(`/`);
      return;
    }
    navigate(`/gallery/${galleryName}`);
  };

  const handleDeleteImage = async () => {
    if (!window.confirm("Delete Photo?")) {
      return;
    }

    await apiDeletePhoto(galleryName, albumNameS, selectedImageIndex);
    let newImages = [...images];
    newImages.splice(selectedImageIndex, 1);
    setImages(newImages);

    setSelectedImageIndex(-1);
    navigate(`/gallery/${galleryName}/album/${albumNameS}`);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
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
                    <p className="text">Back</p>
                  </span>
                </div>
              )
            }
            {isLoading ? (
              <h1>Loading ...</h1>
            ) : albumLength !== -1 ? (
              <div>
                {albumName ? (
                  <h1>{albumName}</h1>
                ) : (
                  <h1 className="title">{galleryName}</h1>
                )}
                {props.hasAdminAccess && (
                  <span
                    className="delete-button"
                    onClick={async () => {
                      let promptInput = prompt(
                        `Enter the album name to confirm deletion. (${albumNameS})`
                      );
                      if (promptInput) {
                        if (promptInput === albumNameS) {
                          await apiDeleteAlbum(galleryName, albumNameS);
                          handleClickBackButton();
                          window.location.reload();
                          return;
                        }
                      }
                      alert("Album names did not match.");
                    }}
                  >
                    <p className="text">Delete</p>
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
                        if (albumName) {
                          navigate(
                            `/gallery/${galleryName}/album/${albumNameS}/image/${i}`
                          );
                        } else {
                          navigate(`/gallery/${galleryName}/image/${i}`);
                        }
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
                    album={albumNameS}
                    onExit={() => setSelectedNewImage(false)}
                  />
                )}
              </div>
            ) : (
              <h1>404 Album Not Found</h1>
            )}
          </div>
        }
      />
      <Route
        path="/image/:index"
        element={
          <ImagePage
            src={
              selectedImageIndex === -1 ? undefined : images[selectedImageIndex]
            }
            hasAdminAccess={props.hasAdminAccess}
            handleBackButton={() => {
              setSelectedImageIndex(-1);
              if (albumName) {
                navigate(`/gallery/${galleryName}/album/${albumNameS}`);
              } else {
                navigate(`/gallery/${galleryName}`);
              }
            }}
            handleImageDelete={handleDeleteImage}
          />
        }
      />
      <Route path="*" element={<h1>404 Page not found</h1>} />
    </Routes>
  );
};

export default AlbumPage;
