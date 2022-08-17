import { useEffect, useState } from "react";
import { apiGetGalleryList, apiGetGalleryPreview } from "../Api/ApiFunctions";
import GalleryPreview from "../Components/GalleryPreview";

const MainPage = (): JSX.Element => {
  const [galleryList, setGalleries] = useState<string[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchGalleries = async () => {
      setGalleries(await apiGetGalleryList());
    };

    fetchGalleries();
  }, []);

  useEffect(() => {
    if (galleryPreviews.length >= galleryList.length) {
      return;
    }
    const fetchPreview = async () => {
      let newPreviews = [...galleryPreviews];
      newPreviews.push(
        await apiGetGalleryPreview(galleryList[galleryPreviews.length])
      );
      setGalleryPreviews(newPreviews);
    };
    fetchPreview();
  }, [galleryList, galleryPreviews]);

  return galleryList.length === 0 ? (
    <h1>Loading ...</h1>
  ) : (
    <div>
      {galleryList.map((gallery, i) => (
        <div key={i}>
          <GalleryPreview name={gallery} image={galleryPreviews[i]} />
        </div>
      ))}
    </div>
  );
};

export default MainPage;
