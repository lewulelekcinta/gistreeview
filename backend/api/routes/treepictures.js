import express from "express";
import { PrismaClient } from "@prisma/client";
import { uploadTreePicture } from "../../src/middleware/upload.js";

const prisma = new PrismaClient();
const router = express.Router();

// Get all tree pictures
router.get("/", async (req, res) => {
  try {
    const pictures = await prisma.treePicture.findMany({
      include: {
        tree: true,
      },
    });
    res.json(pictures);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data gambar pohon" });
  }
});

// Get specific tree picture
router.get("/:id", async (req, res) => {
  try {
    const picture = await prisma.treePicture.findUnique({
      where: { id: req.params.id },
      include: {
        tree: true,
      },
    });
    if (!picture) {
      return res.status(404).json({ error: "Gambar pohon tidak ditemukan" });
    }
    res.json(picture);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data gambar pohon" });
  }
});

// Upload tree picture
router.post("/", uploadTreePicture.single("picture"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const picture = await prisma.treePicture.create({
      data: {
        url: req.file.path,
        treeId: req.body.treeId,
      },
      include: {
        tree: true,
      },
    });
    res.json(picture);
  } catch (err) {
    res.status(500).json({ error: "Gagal upload gambar pohon" });
  }
});

// Delete tree picture
router.delete("/:id", async (req, res) => {
  try {
    await prisma.treePicture.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus gambar pohon" });
  }
});

export default router;