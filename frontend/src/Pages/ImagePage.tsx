import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGetImage } from "../Api/ApiFunctions";
import Image from "../Components/Image";
import ImageSize from "../Models/ImageSize";

const ImagePage = (props: {
  src?: string;
  album?: string;
  hasAdminAccess: boolean;
  handleImageDelete: () => void;
  handleBackButton: () => void;
}): JSX.Element => {
  const [imageData, setImageData] = useState<string>("");
  const [loadingSize, setLoadingSize] = useState<ImageSize>(ImageSize.x);
  const [albumNameS, setAlbumName] = useState<string>("");

  const { galleryName, albumName, index } = useParams();

  useEffect(() => {
    if (!albumName) {
      if (!props.album) {
        return;
      }
      setAlbumName(props.album);
    } else {
      setAlbumName(albumName);
    }
  }, [albumName, props.album]);

  useEffect(() => {
    if (props.src) {
      setImageData(props.src);
      return;
    }
    const getImageData = async () => {
      if (galleryName && albumNameS && index) {
        setImageData(
          await apiGetImage(
            galleryName,
            albumNameS,
            parseInt(index),
            loadingSize
            /* ImageSize.x */
          )
        );
        if (loadingSize !== ImageSize.m) {
          setLoadingSize(loadingSize + 1);
        }
      }
    };
    getImageData();
  }, [albumNameS, galleryName, index, loadingSize, props.src]);

  return (
    <div className="album-page">
      <div className="image-page">
        <button
          className="material-symbols-outlined back-button"
          onClick={props.handleBackButton}
        >
          arrow_back
        </button>

        {props.hasAdminAccess && (
          <button className="delete-button" onClick={props.handleImageDelete}>
            Delete
          </button>
        )}
        <Image src={imageData} size={ImageSize.m} />
      </div>
    </div>
  );
};

export default ImagePage;
