import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAlbumImage, getAlbumLength } from "./Api/AlbumApi";
import Image from "./Components/Image";

const AlbumPage = (): JSX.Element => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { albumName } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPhoto = async () => {
      if (!albumName) {
        setIsLoading(false);
        return;
      }
      if (photos.length >= (await getAlbumLength(albumName))) {
        setIsLoading(false);
        return;
      }
      setPhotos([
        ...photos,
        await getAlbumImage(albumName, photos.length, "s"),
      ]);
      setIsLoading(false);
    };
    fetchPhoto();
  }, [photos, albumName]);

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
