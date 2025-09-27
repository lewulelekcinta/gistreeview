import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const roads = await prisma.road.findMany({
      include: {
        trees: true,
        roadPictures: true,
      },
    });
    res.json(roads);
  } catch (err) {
    console.error('Failed to fetch roads:', err);
    res.status(500).json({ error: "Gagal mengambil data jalan" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const road = await prisma.road.findUnique({
      where: { id: req.params.id },
      include: {
        trees: true,
        roadPictures: true,
      },
    });
    if (!road) {
      return res.status(404).json({ error: "Jalan tidak ditemukan" });
    }
    res.json(road);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data jalan" });
  }
});

router.post("/", async (req, res) => {
  try {
    const road = await prisma.road.create({
      data: req.body,
      include: {
        trees: true,
        roadPictures: true,
      },
    });
    res.json(road);
  } catch (err) {
    res.status(500).json({ error: "Gagal menambah jalan" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const road = await prisma.road.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        trees: true,
        roadPictures: true,
      },
    });
    res.json(road);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengedit jalan" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.road.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus jalan" });
  }
});

export default router;