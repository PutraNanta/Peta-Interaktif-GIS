const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const pointController = require("../controllers/pointController");
const kategoriController = require("../controllers/kategoriController");
const authMiddleware = require("../middleware/authMiddleware");

// === AUTH (Public) ===
router.post("/register", authController.register);
router.post("/login", authController.login);

// === KATEGORI (Public GET, Admin CRUD) ===
router.get("/kategori", kategoriController.getAllKategori);
router.post("/kategori", authMiddleware, kategoriController.createKategori);
router.put("/kategori/:id", authMiddleware, kategoriController.updateKategori);
router.delete("/kategori/:id", authMiddleware, kategoriController.deleteKategori);

// === EXPLORE (Public – semua marker) ===
router.get("/points/explore", pointController.explorePoints);

// === POINTS (Private – perlu token) ===
router.get("/points", authMiddleware, pointController.getAllPoints);
router.post("/points", authMiddleware, pointController.createPoint);
router.put("/points/:id", authMiddleware, pointController.updatePoint);
router.put("/points/:id/approve", authMiddleware, pointController.approvePoint);
router.put("/points/:id/reject", authMiddleware, pointController.rejectPoint);
router.delete("/points/:id", authMiddleware, pointController.deletePoint);

module.exports = router;
