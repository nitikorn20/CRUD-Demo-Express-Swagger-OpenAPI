// openapi/components.js
module.exports = {
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      // ----- Users -----
      User: {
        type: "object",
        required: ["name", "email"],
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Alice" },
          email: { type: "string", example: "alice@example.com" },
        },
      },
      NewUser: {
        type: "object",
        required: ["name", "email"],
        properties: {
          name: { type: "string", example: "Bob" },
          email: { type: "string", example: "bob@example.com" },
        },
      },

      // ----- Todos -----
      Todo: {
        type: "object",
        required: ["title"],
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "Buy milk" },
          done: { type: "boolean", example: false },
          userId: { type: "integer", example: 1, nullable: true },
        },
      },
      NewTodo: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", example: "Learn Swagger" },
          done: { type: "boolean", default: false },
          userId: { type: "integer", example: 1, nullable: true },
        },
      },

      Error: {
        type: "object",
        properties: { message: { type: "string", example: "Not found" } },
      },
    },
  },
};
