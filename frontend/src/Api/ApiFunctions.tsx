import axios from "axios";
import ImageSize, { imageSizeToString } from "../Models/ImageSize";
import ServerURL from "./ServerURL";

export const apiGetGalleryList = async (): Promise<string[]> => {
  const res = await axios.get(`${ServerURL}/gallery_list`);
  return res.data.split("\n");
};

export const apiGetAlbumList = async (gallery: string): Promise<string[]> => {
  const res = await axios.get(`${ServerURL}/album_list?gallery=${gallery}`);
  if (res.data.length === 0) {
    return [];
  }
  return res.data.split("\n");
};

export const apiGetAlbumLength = async (
  gallery: string,
  album: string
): Promise<number> => {
  const res = await axios.get(
    `${ServerURL}/album_length?gallery=${gallery}&album=${album}`
  );
  return parseInt(res.data);
};

export const apiGetImage = async (
  gallery: string,
  album: string,
  index: number,
  size: ImageSize
): Promise<string> => {
  const res = await axios.get(
    `${ServerURL}/image?gallery=${gallery}&album=${album}&index=${index}&size=${imageSizeToString(
      size
    )}`
  );
  return res.data;
};

export const apiGetGalleryPreview = async (
  galleryName: string
): Promise<string> => {
  const res = await axios.get(
    `${ServerURL}/image_random?gallery=${galleryName}&size=s`
  );
  return res.data;
};

export const apiGetHasAdminAccess = async (gallery: string) => {
  const res = await axios.get(`${ServerURL}/has_admin?gallery=${gallery}`, {
    withCredentials: true,
  });
  return res.data;
};

export const apiPostPhoto = async (imageData: Uint8Array, gallery: string, album: string) => {
  await axios.post(`${ServerURL}/image?gallery=${gallery}&album=${album}`, imageData, {
    withCredentials: true,
  });
};

export const apiDeletePhoto = async (gallery: string, album: string, index: number) => {
  await axios.delete(`${ServerURL}/image?gallery=${gallery}&album=${album}&index=${index}`, {
    withCredentials: true,
  });
};
