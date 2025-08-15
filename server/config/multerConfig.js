import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg and .png files are allowed"), false);
  }
};

// Disk storage for profile avatar
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatar");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = uuidv4() + ext;
    cb(null, uniqueName);
  },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 500_000 },
  fileFilter: imageFileFilter,
});

// Memory storage for Posts thumbnail
const memoryStorage = multer.memoryStorage();
export const uploadPost = multer({
  storage: memoryStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});
