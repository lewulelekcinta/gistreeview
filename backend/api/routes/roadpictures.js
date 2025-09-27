import express from "express";
import { PrismaClient } from "@prisma/client";
import { uploadRoadPicture } from "../../src/middleware/upload.js";

const prisma = new PrismaClient();
const router = express.Router();

// Get all road pictures
router.get("/", async (req, res) => {
  try {
    const pictures = await prisma.roadPicture.findMany({
      include: {
        road: true,
      },
    });
    res.json(pictures);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data gambar jalan" });
  }
});

// Get specific road picture
router.get("/:id", async (req, res) => {
  try {
    const picture = await prisma.roadPicture.findUnique({
      where: { id: req.params.id },
      include: {
        road: true,
      },
    });
    if (!picture) {
      return res.status(404).json({ error: "Gambar jalan tidak ditemukan" });
    }
    res.json(picture);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data gambar jalan" });
  }
});

// Upload road picture
router.post("/", uploadRoadPicture.single("picture"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const picture = await prisma.roadPicture.create({
      data: {
        url: req.file.path,
        roadId: req.body.roadId,
      },
      include: {
        road: true,
      },
    });
    res.json(picture);
  } catch (err) {
    res.status(500).json({ error: "Gagal upload gambar jalan" });
  }
});

// Delete road picture
router.delete("/:id", async (req, res) => {
  try {
    await prisma.roadPicture.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus gambar jalan" });
  }
});

export default router;