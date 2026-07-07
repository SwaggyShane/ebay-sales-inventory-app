import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export default function authRoutes(pool) {
  const router = express.Router();

  // Register
  router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
      const hash = await bcrypt.hash(password, 10);
      const result = await pool.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
        [email, hash]
      );
      const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET);
      res.json({ user: result.rows[0], token });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
      res.json({ user: { id: user.id, email: user.email }, token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Middleware to verify JWT
  router.use((req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // Get current user
  router.get('/me', async (req, res) => {
    try {
      const result = await pool.query('SELECT id, email FROM users WHERE id = $1', [req.userId]);
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
