import axios from "axios";
import ImageSize, {imageSizeToString} from "../Models/ImageSize";
import ServerURL from "./ServerURL";

export const getAlbumList = async (): Promise<string[]> => {
  const res = await axios.get(`${ServerURL}/album/list`);
  return res.data.split("\n");
};

export const getAlbumLength = async (albumName: string): Promise<number> => {
  const res = await axios.get(`${ServerURL}/album/length?name=${albumName}`);
  return parseInt(res.data);
};

export const getAlbumImage = async (
  albumName: string,
  index: number,
  size: ImageSize
): Promise<string> => {
  const res = await axios.get(
    `${ServerURL}/image?album=${albumName}&index=${index}&size=${imageSizeToString(size)}`
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
