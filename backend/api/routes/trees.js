import express from "express";
import { PrismaClient } from "@prisma/client";
import { uploadTreePicture } from "../../src/middleware/upload.js";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/treepictures - ambil semua gambar pohon
router.get("/treepictures", async (req, res) => {
  try {
    const pictures = await prisma.treePicture.findMany();
    res.json(pictures);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data gambar pohon" });
  }
});

// GET /api/trees - ambil semua data pohon
router.get("/", async (req, res) => {
  const start = Date.now();
  try {
    const trees = await prisma.tree.findMany({
      include: { road: true, treePictures: true },
    });
    res.json(trees);
    const took = Date.now() - start;
    console.info(`GET /api/trees returned ${trees.length} trees in ${took}ms`);
  } catch (err) {
    console.error('GET /api/trees error:', err && err.message ? err.message : err, err && err.stack ? err.stack : 'no-stack');
    const safeMessage = process.env.NODE_ENV === 'production' ? 'Gagal mengambil data pohon' : (err && err.message ? err.message : String(err));
    res.status(500).json({ error: safeMessage });
  }
});

// GET /api/trees/:id - ambil satu pohon beserta relasinya
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const tree = await prisma.tree.findUnique({ where: { id }, include: { road: true, treePictures: true } });
    if (!tree) return res.status(404).json({ error: 'Tree not found' });
    res.json(tree);
  } catch (err) {
    console.error('Failed to fetch tree', err);
    res.status(500).json({ error: 'Gagal mengambil pohon' });
  }
});

// POST /api/trees - tambah pohon baru
router.post("/", async (req, res) => {
  try {
    const tree = await prisma.tree.create({ data: req.body, include: { road: true, treePictures: true } });
    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: "Gagal menambah pohon" });
  }
});

// PUT /api/trees/:id - edit pohon
router.put("/:id", async (req, res) => {
  try {
    console.log(`PUT /api/trees/${req.params.id} - received body:`, req.body);
    const tree = await prisma.tree.update({
      where: { id: req.params.id },
      data: req.body,
      include: { road: true, treePictures: true },
    });
    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengedit pohon" });
  }
});

// DELETE /api/trees/:id - hapus pohon
router.delete("/:id", async (req, res) => {
  try {
    await prisma.tree.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error("Error saat hapus pohon:", err);
    res.status(500).json({ error: "Gagal menghapus pohon" });
  }
});

export default router;