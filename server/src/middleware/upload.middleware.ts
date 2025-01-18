import multer from "multer";
import { CustomRequest } from "../types/auth.type";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 60 * 1024 * 1024; // 60MB

// TODO: change destination to a cloud storage S3
const storage = multer.memoryStorage();

// Filter file type and size
const fileFilter = (req: CustomRequest, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  if (!ACCEPTED_IMAGE_TYPES.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only JPG, PNG and WebP allowed'));
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return cb(new Error('File too large. Maximum size is 60MB'));
  }

  cb(null, true);
};


const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter
});

export { upload };