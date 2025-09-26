// schemas/user.schema.js
const { z } = require("zod");

const NewUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const UserSchema = NewUserSchema.extend({
  id: z.number().int().positive(),
});

module.exports = { NewUserSchema, UserSchema };
