// middlewares/validate.js
const validate =
  (schema) =>
  (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ");
      return res.status(400).json({ message });
    }
    req.body = parsed.data; // sanitized
    next();
  };

module.exports = { validate };
