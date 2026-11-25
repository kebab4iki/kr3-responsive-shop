import sizesByFile from './responsive-images.json';
import { imageUrl, standalone } from './shop';

export function responsiveSource(filename, fallback) {
  const variants = standalone ? fallback : sizesByFile[filename] ?? fallback;
  return variants?.map(([file, width]) => `${imageUrl(file)} ${width}w`).join(', ');
}

export function thumbnailUrl(filename) {
  const [smallest] = sizesByFile[filename] ?? [];
  return imageUrl(!standalone && smallest?.[1] === 120 ? smallest[0] : filename);
}
