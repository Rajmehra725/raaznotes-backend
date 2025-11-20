import Album from "../models/Album.js";
import crypto from "crypto";
import archiver from "archiver";
import axios from "axios";


// CREATE ALBUM
export const createAlbum = async (req, res) => {
  try {
    const { name } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No photos uploaded" });
    }

    const albumId = crypto.randomBytes(5).toString("hex");

    const photos = files.map(file => file.path);

    const album = await Album.create({
      albumId,
      name,
      photos,
    });

    res.json({
      message: "Album created successfully",
      albumId: album.albumId,
      photos: album.photos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ GET ALL ALBUMS
export const getAllAlbums = async (req, res) => {
  try {
    const albums = await Album.find().sort({ createdAt: -1 });

    res.json({
      message: "All albums fetched successfully",
      albums,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// GET ALBUM
export const getAlbum = async (req, res) => {
  try {
    const albumId = req.params.albumId;

    const album = await Album.findOne({ albumId });

    if (!album) {
      return res.status(404).json({ message: "Album Not Found" });
    }

    res.json({
      success: true,
      album: {
        albumId: album.albumId,
        name: album.name,
        photos: album.photos, // array of URLs
      }
    });

  } catch (err) {
    console.error("Album Fetch Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};



// UPDATE ALBUM
export const updateAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    const { name, removePhotos } = req.body;

    const album = await Album.findOne({ albumId });
    if (!album) return res.status(404).json({ message: "Album not found" });

    if (name) album.name = name;

    if (removePhotos && removePhotos.length > 0) {
      album.photos = album.photos.filter(photo => !removePhotos.includes(photo));
    }

    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(file => file.path);
      album.photos.push(...newPhotos);
    }

    await album.save();

    res.json({
      message: "Album updated",
      album,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// DELETE ALBUM
export const deleteAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;

    const album = await Album.findOneAndDelete({ albumId });

    if (!album) return res.status(404).json({ message: "Album not found" });

    res.json({ message: "Album deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// DOWNLOAD ZIP
export const downloadZip = async (req, res) => {
  try {
    const { photos } = req.body;

    if (!photos || photos.length === 0) {
      return res.status(400).json({ message: "No photos provided" });
    }

    // Single photo download
    if (photos.length === 1) {
      const url = photos[0];
      const fileName = url.split("/").pop();
      const response = await axios.get(url, { responseType: "arraybuffer" });
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
      res.setHeader("Content-Type", "image/jpeg");
      return res.send(response.data);
    }

    // Multiple photos ZIP
    res.setHeader("Content-Disposition", "attachment; filename=photos.zip");
    res.setHeader("Content-Type", "application/zip");

    const archive = archiver("zip");
    archive.on("error", (err) => {
      console.error("Archive Error:", err);
      res.status(500).send({ error: err.message });
    });

    archive.pipe(res);

    for (let url of photos) {
      try {
        const fileName = url.split("/").pop();
        const response = await axios.get(url, { responseType: "arraybuffer" });
        archive.append(response.data, { name: fileName });
      } catch (err) {
        console.error("Failed to download file:", url, err.message);
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error("ZIP Download Error:", error);
    res.status(500).json({ error: error.message });
  }
};


// DOWNLOAD SINGLE PHOTO
export const downloadPhoto = async (req, res) => {
  try {
    const { photoUrl } = req.body; // single photo URL

    if (!photoUrl) {
      return res.status(400).json({ message: "No photo URL provided" });
    }

    // Get file name from URL
    const fileName = photoUrl.split("/").pop();

    // Fetch image as array buffer
    const response = await axios.get(photoUrl, { responseType: "arraybuffer" });

    // Set headers for download
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", "image/jpeg"); // you can adjust type if needed

    // Send the image
    res.send(response.data);

  } catch (error) {
    console.error("Photo Download Error:", error);
    res.status(500).json({ error: error.message });
  }
};
