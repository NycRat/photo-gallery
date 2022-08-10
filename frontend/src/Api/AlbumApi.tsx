import axios from "axios";
import ImageSize, { imageSizeToString } from "../Models/ImageSize";
import ServerURL from "./ServerURL";

export const getGalleryList = async (): Promise<string[]> => {
  const res = await axios.get(`${ServerURL}/gallery_list`);
  return res.data.split("\n");
};

export const getAlbumList = async (gallery: string): Promise<string[]> => {
  const res = await axios.get(`${ServerURL}/album_list?gallery=${gallery}`);
  return res.data.split("\n");
};

export const getAlbumLength = async (
  gallery: string,
  album: string
): Promise<number> => {
  const res = await axios.get(
    `${ServerURL}/album_length?gallery=${gallery}&album=${album}`
  );
  return parseInt(res.data);
};

export const getAlbumImage = async (
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

// export const getAlbumImages = async (albumName: string): Promise<string[]> => {
//   console.log(
//     await axios.get(`${ServerURL}/album/name/` + albumName).then((res) => {
//       return res;
//     })
//   );
//   return [];
// };
