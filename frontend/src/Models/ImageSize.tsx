enum ImageSize {
  x,s,m,l
}

export const imageSizeToString = (size: ImageSize): string => {
  return ImageSize[size];
}

export default ImageSize;
