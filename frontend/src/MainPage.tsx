import { useEffect, useState } from "react";
import { getGalleryList } from "./Api/AlbumApi";
import GalleryPreview from "./Components/GalleryPreview";

const MainPage = (): JSX.Element => {
  const [galleries, setGalleries] = useState<string[]>([]);

  useEffect(() => {
    const fetchGalleries = async () => {
      setGalleries(await getGalleryList());
    };

    fetchGalleries();
  }, []);

  useEffect(() => {
    console.log(galleries);
  }, [galleries]);

  return galleries.length === 0 ? (
    <h1>Loading ...</h1>
  ) : (
    <div>
      {galleries.map((gallery, i) => (
        <GalleryPreview key={i} name={gallery} />
      ))}
    </div>
  );
};

export default MainPage;
