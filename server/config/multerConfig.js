import multer from "multer";

// Разрешённые MIME-типы для изображений
const allowedTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp", // современные Android камеры
  "image/heic", // iPhone
  "image/heif", // iPhone
];

// Функция фильтра Multer
const imageFileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // разрешаем файл
  } else {
    cb(
      new Error("Only images are allowed: jpg, jpeg, png, webp, heic, heif"),
      false
    ); // блокируем файл
  }
};
// Memory storage вместо diskStorage
const avatarStorage = multer.memoryStorage();

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
});

// Memory storage for Posts thumbnail
const memoryStorage = multer.memoryStorage();
export const uploadPost = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
});
