import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        user: true,
        reportPictures: true,
      },
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data laporan" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        reportPictures: true,
      },
    });
    if (!report) {
      return res.status(404).json({ error: "Laporan tidak ditemukan" });
    }
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data laporan" });
  }
});

router.post("/", async (req, res) => {
  try {
    const report = await prisma.report.create({
      data: req.body,
      include: {
        user: true,
        reportPictures: true,
      },
    });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Gagal membuat laporan" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        user: true,
        reportPictures: true,
      },
    });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengupdate laporan" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.report.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus laporan" });
  }
});

export default router;