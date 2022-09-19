import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGetImage } from "../Api/ApiFunctions";
import Image from "../Components/Image";
import ImageSize from "../Models/ImageSize";

const ImagePage = (props: {
  src?: string;
  hasAdminAccess: boolean;
  handleImageDelete: () => void;
  handleBackButton: () => void;
}): JSX.Element => {
  const [imageData, setImageData] = useState<string>("");
  const [loadingSize, setLoadingSize] = useState<ImageSize>(ImageSize.x);

  const { galleryName, albumName, index } = useParams();

  useEffect(() => {
    if (props.src) {
      setImageData(props.src);
      return;
    }
    const getImageData = async () => {
      if (galleryName && albumName && index) {
        setImageData(
          await apiGetImage(
            galleryName,
            albumName,
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
  }, [albumName, galleryName, index, loadingSize, props.src]);

  return (
    <div className="album-page">
      <div className="image-page">
        <span className="back-button" onClick={props.handleBackButton}>
          <p className="text">Back</p>
        </span>
        {props.hasAdminAccess && (
          <span className="delete-button" onClick={props.handleImageDelete}>
            <p className="text">Delete</p>
          </span>
        )}
        <Image src={imageData} size={ImageSize.m} />
      </div>
    </div>
  );
};

export default ImagePage;
