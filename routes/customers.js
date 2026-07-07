import express from 'express';
import { verifyAuth } from './middleware.js';

export default function customerRoutes(pool, io) {
  const router = express.Router();

  router.use(verifyAuth);

  // Get all customers with filtering
  router.get('/', async (req, res) => {
    const { filter, sortBy } = req.query;
    try {
      let query = 'SELECT * FROM customers WHERE user_id = $1';
      const params = [req.userId];

      if (filter === 'return_customers') {
        query += ' AND is_return_customer = true';
      } else if (filter === 'best_customers') {
        query += ' ORDER BY lifetime_spent DESC LIMIT 10';
      }

      if (sortBy === 'lifetime_amount') {
        query = query.includes('ORDER BY') ? query.split('ORDER BY')[0] + ' ORDER BY lifetime_spent DESC' : query + ' ORDER BY lifetime_spent DESC';
      } else if (sortBy === 'average_ticket') {
        query = query.includes('ORDER BY') ? query.split('ORDER BY')[0] + ' ORDER BY average_ticket DESC' : query + ' ORDER BY average_ticket DESC';
      } else if (sortBy === 'purchase_count') {
        query = query.includes('ORDER BY') ? query.split('ORDER BY')[0] + ' ORDER BY purchase_count DESC' : query + ' ORDER BY purchase_count DESC';
      }

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get customer by ID
  router.get('/:id', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM customers WHERE id = $1 AND user_id = $2',
        [req.params.id, req.userId]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get customer sales history
  router.get('/:id/sales', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT s.* FROM sales s JOIN customers c ON s.customer_id = c.id WHERE c.id = $1 AND c.user_id = $2 ORDER BY s.sale_date DESC',
        [req.params.id, req.userId]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get customer notes
  router.get('/:id/notes', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM customer_notes WHERE customer_id = $1 AND user_id = $2 ORDER BY created_at DESC',
        [req.params.id, req.userId]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add note to customer
  router.post('/:id/notes', async (req, res) => {
    const { content, note_type } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO customer_notes (user_id, customer_id, content, note_type) VALUES ($1, $2, $3, $4) RETURNING *',
        [req.userId, req.params.id, content, note_type || 'general']
      );
      io.emit('customer_note_added', result.rows[0]);
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update customer notes
  router.patch('/:id/notes/:noteId', async (req, res) => {
    const { content, is_resolved } = req.body;
    try {
      const result = await pool.query(
        'UPDATE customer_notes SET content = COALESCE($1, content), is_resolved = COALESCE($2, is_resolved), updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING *',
        [content, is_resolved, req.params.noteId, req.userId]
      );
      io.emit('customer_note_updated', result.rows[0]);
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add manual customer
  router.post('/', async (req, res) => {
    const { ebay_username, notes } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO customers (user_id, ebay_username, notes) VALUES ($1, $2, $3) RETURNING *',
        [req.userId, ebay_username, notes]
      );
      io.emit('customer_added', result.rows[0]);
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
