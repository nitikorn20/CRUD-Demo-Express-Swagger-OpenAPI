// routes/users.js
const express = require("express");
const router = express.Router();

// in-memory
let nextId = 3;
let users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Brian", email: "brian@example.com" },
];

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: ดึงรายชื่อผู้ใช้ทั้งหมด
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: รายการผู้ใช้
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/User' }
 */
router.get("/", (_req, res) => res.json(users));

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: ดึงผู้ใช้ตาม id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: พบผู้ใช้
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       404:
 *         description: ไม่พบ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ message: "Not found" });
  res.json(user);
});

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: สร้างผู้ใช้ใหม่
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/NewUser' }
 *     responses:
 *       201:
 *         description: สร้างสำเร็จ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 */
router.post("/", (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) return res.status(400).json({ message: "name/email required" });
  const created = { id: nextId++, name, email };
  users.push(created);
  res.status(201).json(created);
});

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: อัปเดตผู้ใช้ (ทั้งอ็อบเจ็กต์)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/User' }
 *     responses:
 *       200: { description: อัปเดตสำเร็จ }
 *       404: { description: ไม่พบ }
 */
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  const { name, email } = req.body || {};
  users[idx] = { id, name, email };
  res.json(users[idx]);
});

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: ลบผู้ใช้
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: ลบสำเร็จ }
 *       404: { description: ไม่พบ }
 */
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = users.length;
  users = users.filter(u => u.id !== id);
  if (users.length === before) return res.status(404).json({ message: "Not found" });
  res.status(204).send();
});

module.exports = router;
