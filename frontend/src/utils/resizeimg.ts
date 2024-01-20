export const getResizedImagesBase64Main = async (
  imageFiles: File[] | FileList
): Promise<string[]> => {
  const resizedImages = [];
  const base64Promises = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const bitmap = await createImageBitmap(imageFiles[i]);
    if (bitmap.width > 300 || bitmap.height > 300) {
      const maxwidth = 300;
      const scaleSize = maxwidth / bitmap.width;
      const maxheight = bitmap.height * scaleSize;

      const canvas = document.createElement("canvas");
      canvas.width = maxwidth;
      canvas.height = maxheight;

      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      const base64Str = ctx.canvas.toDataURL("image/jpeg", 0.8);
      resizedImages.push(base64Str);
    } else {
      base64Promises.push(getBase64String(imageFiles[i]));
    }
  }

  return [...resizedImages, ...(await Promise.all(base64Promises))];
};

const getBase64String = async (imgBlob: Blob | File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(imgBlob);
    reader.addEventListener("load", (e) => {
      resolve(e.target?.result as string);
    });
  });
};
