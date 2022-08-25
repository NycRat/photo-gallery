import { useEffect, useRef, useState } from "react";
import { Route, Routes } from "react-router-dom";
import {
  apiGetGalleryList,
  apiGetImage,
  apiGetRandomAlbum,
  apiGetRandomImageIndex,
} from "../Api/ApiFunctions";
import GalleryPreview from "../Components/GalleryPreview";
import ImageSize from "../Models/ImageSize";
import GalleryPage from "./GalleryPage";

const MainPage = (): JSX.Element => {
  const [galleryList, setGalleries] = useState<string[]>([]);
  const previewAlbums = useRef<string[]>([]);
  const previewIndices = useRef<number[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [loadedX, setLoadedX] = useState<boolean>(false);
  const loadIndex = useRef<number>(0);

  useEffect(() => {
    const fetchGalleries = async () => {
      setGalleries(await apiGetGalleryList());
    };
    console.log("Xd");

    fetchGalleries();
  }, []);

  useEffect(() => {
    if (galleryList.length === 0) {
      return;
    }
    if (loadIndex.current >= galleryList.length) {
      if (!loadedX) {
        setLoadedX(true);
        loadIndex.current = 0;
      }
      return;
    }
    const fetchPreview = async () => {
      let gallery = galleryList[loadIndex.current];
      if (loadedX) {
        let imageSize = ImageSize.s;
        let preview = await apiGetImage(
          gallery,
          previewAlbums.current[loadIndex.current],
          previewIndices.current[loadIndex.current],
          imageSize
        );

        let newPreviews = [...galleryPreviews];
        newPreviews[loadIndex.current] = preview;
        setGalleryPreviews(newPreviews);
      } else {
        let album = await apiGetRandomAlbum(gallery);
        let index = await apiGetRandomImageIndex(gallery, album);
        let imageSize = ImageSize.x;
        let preview = await apiGetImage(gallery, album, index, imageSize);
        previewIndices.current.push(index);
        previewAlbums.current.push(album);

        setGalleryPreviews([...galleryPreviews, preview]);
      }
      loadIndex.current++;
    };
    fetchPreview();
  }, [galleryList, galleryPreviews, loadedX]);

  return galleryList.length === 0 ? (
    <h1>Loading ...</h1>
  ) : (
    <Routes>
      <Route
        path="/"
        element={
          <div>
            {galleryList.map((gallery, i) => (
              <div key={i}>
                <GalleryPreview name={gallery} image={galleryPreviews[i]} />
              </div>
            ))}
          </div>
        }
      />
      <Route path="/gallery/:galleryName/*" element={<GalleryPage />} />
      <Route path="*" element={<h1>404 Page Not Found</h1>} />
    </Routes>
  );
};

export default MainPage;
