import express from "express";
import { PrismaClient } from "@prisma/client";
import { uploadReportPicture } from "../../src/middleware/upload.js";

const prisma = new PrismaClient();
const router = express.Router();

// Get all report pictures
router.get("/", async (req, res) => {
  try {
    const pictures = await prisma.reportPicture.findMany({
      include: {
        report: true,
      },
    });
    res.json(pictures);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data gambar laporan" });
  }
});

// Get specific report picture
router.get("/:id", async (req, res) => {
  try {
    const picture = await prisma.reportPicture.findUnique({
      where: { id: req.params.id },
      include: {
        report: true,
      },
    });
    if (!picture) {
      return res.status(404).json({ error: "Gambar laporan tidak ditemukan" });
    }
    res.json(picture);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data gambar laporan" });
  }
});

// Upload report picture
router.post("/", uploadReportPicture.single("picture"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const picture = await prisma.reportPicture.create({
      data: {
        url: req.file.path,
        reportId: req.body.reportId,
      },
      include: {
        report: true,
      },
    });
    res.json(picture);
  } catch (err) {
    res.status(500).json({ error: "Gagal upload gambar laporan" });
  }
});

// Delete report picture
router.delete("/:id", async (req, res) => {
  try {
    await prisma.reportPicture.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus gambar laporan" });
  }
});

export default router;