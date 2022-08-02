import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Photo from "./Components/PhotoPreview";

const AlbumPage = (): JSX.Element => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { albumName } = useParams();

  useEffect(() => {
    const fetchPhotos = async (): Promise<void> => {
      if (!albumName) {
        setIsLoading(false);
        return;
      }
      // fetch photos using album name
      setPhotos([]);
      setIsLoading(false);
    };
    fetchPhotos();
  }, [albumName]);

  return (
    <div className="album-page">
      {isLoading ? (
        <div>Loading ...</div>
      ) : photos.length !== 0 ? (
        <div>
          <h1>{albumName}</h1>
          {photos.map((photo, i) => (
            <Photo key={i} src={photo} />
          ))}
        </div>
      ) : (
        <div>404 Album Not Found</div>
      )}
    </div>
  );
};

export default AlbumPage;
