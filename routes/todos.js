// routes/todos.js
const express = require("express");
const router = express.Router();

let nextTodoId = 3;
let todos = [
  { id: 1, title: "Buy milk", done: false, userId: 1 },
  { id: 2, title: "Write Swagger doc", done: true, userId: 2 },
];

/**
 * @openapi
 * /api/todos:
 *   get:
 *     summary: ดึง todos ทั้งหมด (กรอง userId ได้)
 *     tags: [Todos]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: { type: integer }
 *         description: กรองตามเจ้าของงาน
 *     responses:
 *       200:
 *         description: รายการ todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Todo' }
 */
router.get("/", (req, res) => {
  const userId = req.query.userId ? Number(req.query.userId) : undefined;
  const data = userId ? todos.filter(t => t.userId === userId) : todos;
  res.json(data);
});

/**
 * @openapi
 * /api/todos/{id}:
 *   get:
 *     summary: ดึง todo ตาม id
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: พบรายการ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Todo' }
 *       404:
 *         description: ไม่พบ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const item = todos.find(t => t.id === id);
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json(item);
});

/**
 * @openapi
 * /api/todos:
 *   post:
 *     summary: สร้าง todo ใหม่
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/NewTodo' }
 *     responses:
 *       201:
 *         description: สร้างสำเร็จ
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Todo' }
 */
router.post("/", (req, res) => {
  const { title, done = false, userId } = req.body || {};
  if (!title) return res.status(400).json({ message: "title is required" });
  const created = { id: nextTodoId++, title, done, userId: userId ?? null };
  todos.push(created);
  res.status(201).json(created);
});

/**
 * @openapi
 * /api/todos/{id}:
 *   put:
 *     summary: อัปเดต todo (ทั้งอ็อบเจ็กต์)
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Todo' }
 *     responses:
 *       200: { description: อัปเดตสำเร็จ }
 *       404: { description: ไม่พบ }
 */
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = todos.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  const { title, done, userId } = req.body || {};
  todos[idx] = { id, title, done, userId: userId ?? null };
  res.json(todos[idx]);
});

/**
 * @openapi
 * /api/todos/{id}:
 *   delete:
 *     summary: ลบ todo
 *     tags: [Todos]
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
  const before = todos.length;
  todos = todos.filter(t => t.id !== id);
  if (todos.length === before) return res.status(404).json({ message: "Not found" });
  res.status(204).send();
});

module.exports = router;
