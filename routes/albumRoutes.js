import express from "express";
import { uploadAlbumPhotos } from "../config/cloudinary.js";
import { 
  createAlbum, 
  getAlbum, 
  updateAlbum, 
  deleteAlbum, 
  downloadZip ,
  getAllAlbums
,
downloadPhoto} from "../controllers/albumController.js";

const router = express.Router();

router.get("/", getAllAlbums);     // <-- best practice
router.post("/create", uploadAlbumPhotos, createAlbum);
router.get("/:albumId", getAlbum);
router.put("/:albumId", uploadAlbumPhotos, updateAlbum);
router.delete("/:albumId", deleteAlbum);
router.post("/download-zip", downloadZip);
router.post("/download-photo", downloadPhoto);
export default router;
