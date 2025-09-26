// schemas/todo.schema.js
const { z } = require("zod");

const NewTodoSchema = z.object({
  title: z.string().min(1),
  done: z.boolean().optional(),
  userId: z.number().int().positive().optional().nullable(),
});

const TodoSchema = NewTodoSchema.extend({
  id: z.number().int().positive(),
});

module.exports = { NewTodoSchema, TodoSchema };
