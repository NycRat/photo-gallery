import axios from "axios";
import { Cookies } from "react-cookie";
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

export const apiGetRandomAlbum = async (gallery: string): Promise<string> => {
  const res = await axios.get(`${ServerURL}/album_random?gallery=${gallery}`);
  return res.data;
};

export const apiGetRandomImageIndex = async (
  gallery: string,
  album: string
): Promise<number> => {
  const res = await axios.get(
    `${ServerURL}/image_index_random?gallery=${gallery}&album=${album}`
  );
  return parseInt(res.data);
};

export const apiGetHasAdminAccess = async (gallery: string) => {
  const token = new Cookies().get("auth_token");
  const res = await axios.get(`${ServerURL}/has_admin?gallery=${gallery}`, {
    // withCredentials: true,
    headers: {
      token: token,
    },
  });
  return res.data;
};

export const apiPostPhoto = async (
  imageData: Uint8Array,
  gallery: string,
  album: string
) => {
  const token = new Cookies().get("auth_token");
  await axios.post(
    `${ServerURL}/image?gallery=${gallery}&album=${album}`,
    imageData,
    {
      // withCredentials: true,
      headers: {
        token: token,
      },
    }
  );
};

export const apiDeletePhoto = async (
  gallery: string,
  album: string,
  index: number
) => {
  const token = new Cookies().get("auth_token");
  await axios.delete(
    `${ServerURL}/image?gallery=${gallery}&album=${album}&index=${index}`,
    {
      // withCredentials: true,
      headers: {
        token: token,
      },
    }
  );
};

export const apiPostAlbum = async (gallery: string, album: string) => {
  const token = new Cookies().get("auth_token");
  await axios.post(
    `${ServerURL}/album?gallery=${gallery}&album=${album}`,
    {},
    {
      // withCredentials: true,
      headers: {
        token: token,
      },
    }
  );
};

export const apiDeleteAlbum = async (gallery: string, album: string) => {
  const token = new Cookies().get("auth_token");
  await axios.delete(`${ServerURL}/album?gallery=${gallery}&album=${album}`, {
    // withCredentials: true,
    headers: {
      token: token,
    },
  });
};

export const apiUpdateServerCache = async () => {
  const token = new Cookies().get("auth_token");
  await axios.post(
    `${ServerURL}/cache`,
    {},
    {
      headers: {
        token: token,
      },
    }
  );
  alert("Updated Server Cache");
};
