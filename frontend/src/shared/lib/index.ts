const fileTypes = {
  image: ["jpg", "jpeg", "png", "gif", "bmp"],
  video: ["mp4", "avi", "mov", "mkv", "flv"],
  file: [""],
};

export const getFileType = (filetype: string): keyof typeof fileTypes => {
  const extension = filetype.toLowerCase();

  for (const fileType of Object.keys(fileTypes) as (keyof typeof fileTypes)[]) {
    if (fileTypes[fileType].includes(extension)) {
      return fileType;
    }
  }

  return "file";
};
