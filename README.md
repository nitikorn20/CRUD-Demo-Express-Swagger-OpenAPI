# CRUD Demo – Express + Swagger (OpenAPI 3)

ตัวอย่าง REST API สำหรับมือใหม่ ใช้ **Express** ทำ API และ **Swagger UI** สำหรับเอกสารแบบ interactive

โครงสร้างนี้แยก **OpenAPI components**, **Routes**, และ (option) **Runtime validation** ออกจากกัน เพื่อพร้อมต่อยอดเชื่อมต่อ **ฐานข้อมูล** (เช่น MongoDB/Mongoose) ในอนาคต

---

## คุณสมบัติ

* 2 ทรัพยากร: `Users`, `Todos`
* ครบเมธอด: `GET (list/byId)`, `POST`, `PUT`, `DELETE`
* ไม่ใช้ฐานข้อมูล (in-memory) แต่โครงสร้างพร้อมต่อยอด DB
* เอกสาร API ที่ `/docs` (**Swagger UI + Try it out**)

---

## โครงสร้างโปรเจกต์

```
node-swagger-crud/
├─ app.js                     # server หลัก + swagger-setup
├─ openapi/
│  ├─ info.js                 # ข้อมูลทั่วไป (title/version/servers)
│  └─ components.js           # OpenAPI components/schemas/security
├─ routes/
│  ├─ users.js                # CRUD Users (in-memory)
│  └─ todos.js                # CRUD Todos (in-memory)
├─ schemas/                   # (optional) runtime validation (Zod/Joi)
│  ├─ user.schema.js
│  └─ todo.schema.js
└─ middlewares/
   └─ validate.js             # (optional) middleware ตรวจ body
```

> แนวทาง: ให้ `openapi/*` ดูแล *เอกสาร* (info/servers/components) และให้ `routes/*` ใส่ @openapi เฉพาะส่วน **paths** ส่วน `schemas/*` ไว้ตรวจข้อมูล runtime (พร้อม reuse กับ DB layer)

---

## เริ่มต้นใช้งาน

> ต้องใช้ **Node.js >= 18**

```bash
# 1) ติดตั้งแพ็กเกจ
npm install

# 2) รันเซิร์ฟเวอร์
node app.js
# หรือ
npx nodemon app.js
```

เปิดเบราว์เซอร์: [http://localhost:3000/docs](http://localhost:3000/docs)

---

## สรุป Endpoints

### Users

* `GET /api/users` — รายชื่อผู้ใช้ทั้งหมด
* `GET /api/users/{id}` — ดึงผู้ใช้ตาม id
* `POST /api/users` — สร้างผู้ใช้ใหม่ (ต้องมี `name`, `email`)
* `PUT /api/users/{id}` — อัปเดตผู้ใช้ทั้งอ็อบเจกต์
* `DELETE /api/users/{id}` — ลบผู้ใช้

### Todos

* `GET /api/todos` — รายการ todos ทั้งหมด (รองรับ `?userId=...` เพื่อกรอง)
* `GET /api/todos/{id}` — ดึง todo ตาม id
* `POST /api/todos` — สร้าง todo (`title` บังคับ, `done` ออปชัน, `userId` ออปชัน)
* `PUT /api/todos/{id}` — อัปเดต todo ทั้งอ็อบเจกต์
* `DELETE /api/todos/{id}` — ลบ todo

> สคีมาที่ใช้สำหรับเอกสารอยู่ใน `openapi/components.js` (`User`, `NewUser`, `Todo`, `NewTodo`, `Error`)

---

## อธิบายโฟลเดอร์หลัก

* **app.js**: ตั้งค่า Express, รวม OpenAPI (จาก `openapi/*` + JSDoc ใน `routes/*`), ลงทะเบียน routes และหน้า `/docs`
* **openapi/info.js**: กำหนดข้อมูลพื้นฐานของเอกสาร (title, version, servers)
* **openapi/components.js**: รวม `components` ของ OpenAPI เช่น `schemas`, `securitySchemes`
* **routes/**: ไฟล์ route ของทรัพยากรต่าง ๆ พร้อมคอมเมนต์ `@openapi` เพื่อ generate paths
* **schemas/** (ตัวเลือก): สคีมา runtime (เช่น Zod/Joi) สำหรับ validate request ก่อนเขียน/อ่าน DB
* **middlewares/validate.js** (ตัวเลือก): middleware สำหรับเรียกใช้ schema ตรวจ `req.body`

---

## ต่อยอดเชื่อมต่อ MongoDB (Mongoose) — ขั้นตอนแนะนำ

> จาก in-memory → ต่อ Mongo โดยแกน OpenAPI แทบไม่ต้องแก้ (จะปรับเฉพาะ type/id ตามจริง)

### 1) ติดตั้ง & ตั้งค่า Environment

```bash
npm i mongoose dotenv
```

สร้างไฟล์ `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/crud_demo
```

แก้ `app.js` ให้โหลด `.env` และเชื่อมต่อ Mongo:

```js
require('dotenv').config();
const mongoose = require('mongoose');

async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI not set, running in in-memory mode.');
    return;
  }
  await mongoose.connect(uri, { autoIndex: true });
  console.log('MongoDB connected');
}
connectMongo().catch(err => {
  console.error('MongoDB connection failed:', err);
  process.exit(1);
});
```

### 2) สร้างโมเดล Mongoose

```
models/
├─ user.model.js
└─ todo.model.js
```

**models/user.model.js**

```js
const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, unique: true },
  },
  { timestamps: true }
);

// (ทางเลือก) ให้ API ส่ง id แทน _id
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = model('User', userSchema);
```

**models/todo.model.js**

```js
const { Schema, model, Types } = require('mongoose');

const todoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
    userId: { type: Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

todoSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = model('Todo', todoSchema);
```

> **หมายเหตุเรื่อง id**: เดิม (in-memory) ใช้เลขจำนวนเต็ม แต่ Mongo ใช้ `_id` แบบ **ObjectId (string)**
> คุณสามารถ:
>
> 1. เปลี่ยนสคีมา OpenAPI ให้ `id: { type: 'string', example: '64ef0d0c6a0f3a3e0a5acb42' }` หรือ
> 2. ใช้ virtual ด้านบนเพื่อ map `_id` → `id` (แนะนำเพื่อให้ Frontend ใช้สะดวก)

### 3) เปลี่ยนโค้ดใน Routes ให้เรียก DB

**routes/users.js** (ย่อเฉพาะจุดสำคัญ)

```js
const express = require('express');
const router = express.Router();
const User = require('../models/user.model');

router.get('/', async (_req, res, next) => {
  try { res.json(await User.find().lean()); }
  catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id).lean();
    if (!u) return res.status(404).json({ message: 'Not found' });
    res.json(u);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const created = await User.create(req.body); // แนะนำให้ validate ก่อน
    res.status(201).json(created.toJSON());
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, email: req.body.email },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated.toJSON());
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const r = await User.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
```

> `routes/todos.js` ทำแนวเดียวกัน (`Todo.find()`, `findById()`, `create()`, `findByIdAndUpdate()`, `findByIdAndDelete()`)

ตัวอย่างกรอง `userId` (ตรวจว่าเป็น ObjectId ที่ถูกต้อง):

```js
const { isValidObjectId, Types } = require('mongoose');

router.get('/', async (req, res, next) => {
  try {
    const q = {};
    if (req.query.userId && isValidObjectId(req.query.userId)) {
      q.userId = new Types.ObjectId(req.query.userId);
    }
    const todos = await Todo.find(q).lean();
    res.json(todos);
  } catch (err) { next(err); }
});
```

### 4) Error Handler กลาง (แนะนำ)

เพิ่มท้าย `app.js`:

```js
// 404 สำหรับ route ที่ไม่พบ
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler กลาง
app.use((err, req, res, _next) => {
  console.error(err);
  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate key' });
  }
  res.status(500).json({ message: 'Internal Server Error' });
});
```

### 5) อัปเดต OpenAPI ถ้าจะใช้ ObjectId

ตัวอย่างปรับ `User` ให้ `id` เป็นสตริง:

```js
// openapi/components.js (ปรับเฉพาะ id)
User: {
  type: 'object',
  required: ['name', 'email'],
  properties: {
    id: { type: 'string', example: '64ef0d0c6a0f3a3e0a5acb42' },
    name: { type: 'string' },
    email: { type: 'string' },
  },
},
```

---

## ใช้ Runtime Validation (Zod) ควบคู่ (แนะนำ)

**schemas/user.schema.js**

```js
const { z } = require('zod');

const NewUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const UserSchema = NewUserSchema.extend({
  id: z.string().min(1).optional(), // ถ้าใช้ ObjectId string
});

module.exports = { NewUserSchema, UserSchema };
```

**middlewares/validate.js**

```js
const validate = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map(i => `${i.path.join('.')}: ${i.message}`)
      .join(', ');
    return res.status(400).json({ message });
  }
  req.body = parsed.data; // sanitized
  next();
};

module.exports = { validate };
```

**routes/users.js** (ตัวอย่างใช้ validation)

```js
const { validate } = require('../middlewares/validate');
const { NewUserSchema } = require('../schemas/user.schema');

router.post('/', validate(NewUserSchema), async (req, res, next) => {
  try {
    const created = await User.create(req.body);
    res.status(201).json(created.toJSON());
  } catch (err) { next(err); }
});
```

---

ตั้งค่า `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/crud_demo
```

---

## แนวปฏิบัติที่ดีเมื่อโปรเจกต์โต

* แยกเลเยอร์ `controllers/` → `services/` → `repositories/` → `models/`
* ทำ `logger` (เช่น pino/winston), `request-id`, และ `audit logs` ที่จุดสำคัญ
* เขียนเทสต์ (Jest) ทั้ง unit/integration และใช้ `supertest` ยิง endpoint
* จัดการ config ด้วย `dotenv` + schema (เช่น `zod` สำหรับ ENV)
* ทำ CI (lint/test) และ CD (deploy) ตั้งแต่ต้น

---

## License

MIT © Your Name
