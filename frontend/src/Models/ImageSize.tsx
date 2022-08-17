enum ImageSize {
  x,s,m
}

export const imageSizeToString = (size: ImageSize): string => {
  return ImageSize[size];
}

export default ImageSize;
