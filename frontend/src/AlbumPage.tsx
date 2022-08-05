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
    const fetchPhotos = async (): Promise<void> => {
      if (!albumName) {
        setIsLoading(false);
        return;
      }
      let albumPhotos: string[] = [];
      for (let i = 0; i < (await getAlbumLength(albumName)); i++) {
        albumPhotos.push(await getAlbumImage(albumName, i, "s"));
        // TODO - make so rerendering after loading each image
      }
      setPhotos(albumPhotos);
      setIsLoading(false);
    };
    fetchPhotos();
  }, [albumName]);

  return (
    <div className="album-page">
      <button className="back-button" onClick={() => {navigate("/")}}>{"Gallery"}</button>
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
