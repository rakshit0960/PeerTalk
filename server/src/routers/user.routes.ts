import express from "express";
import { verifyToken } from "../middleware/auth.middleware";
import { searchUsers } from "../controllers/users.controller";
import { updateBio, updateName, updateProfilePicture, getPresignedUrl } from "../controllers/user.controller";
import { upload } from "../middleware/upload.middleware";

const router = express.Router();

router.get("/search/:query?", verifyToken, searchUsers);
router.post("/presigned-url", verifyToken, getPresignedUrl);
router.put("/profile/name", verifyToken, updateName);
router.put("/profile/bio", verifyToken, updateBio);
router.put("/profile/picture", verifyToken, upload.single('profilePicture'), updateProfilePicture);

export default router;