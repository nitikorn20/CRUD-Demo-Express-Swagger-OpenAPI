// app.js
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const info = require("./openapi/info");
const components = require("./openapi/components");

const app = express();
app.use(express.json());

// ----- Swagger/OpenAPI (รวม info + components + paths จาก JSDoc ใน routes) -----
const swaggerSpec = swaggerJSDoc({
  swaggerDefinition: { ...info, ...components },
  apis: ["./routes/*.js"], // อ่าน @openapi จากไฟล์ใน routes/*
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ----- Routes -----
app.use("/api/users", require("./routes/users"));
app.use("/api/todos", require("./routes/todos"));

app.get("/", (_req, res) => res.send("OK. เปิดเอกสารที่ /docs"));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT} → /docs`));
