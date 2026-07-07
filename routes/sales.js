import express from 'express';
import { verifyAuth } from './middleware.js';

export default function salesRoutes(pool, io) {
  const router = express.Router();

  router.use(verifyAuth);

  // Get all sales with filtering
  router.get('/', async (req, res) => {
    const { status, dateFrom, dateTo, customerId } = req.query;
    try {
      let query = 'SELECT s.*, c.ebay_username FROM sales s LEFT JOIN customers c ON s.customer_id = c.id WHERE s.user_id = $1';
      const params = [req.userId];
      let paramIndex = 2;

      if (status) {
        query += ` AND s.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }
      if (dateFrom) {
        query += ` AND s.sale_date >= $${paramIndex}`;
        params.push(dateFrom);
        paramIndex++;
      }
      if (dateTo) {
        query += ` AND s.sale_date <= $${paramIndex}`;
        params.push(dateTo);
        paramIndex++;
      }
      if (customerId) {
        query += ` AND s.customer_id = $${paramIndex}`;
        params.push(customerId);
        paramIndex++;
      }

      query += ' ORDER BY s.sale_date DESC';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get sales statistics
  router.get('/stats/summary', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          COUNT(*) as total_sales,
          SUM(total_amount) as total_revenue,
          AVG(total_amount) as avg_ticket,
          COUNT(DISTINCT customer_id) as unique_customers
        FROM sales
        WHERE user_id = $1
      `, [req.userId]);
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add manual sale
  router.post('/', async (req, res) => {
    const { customer_id, item_title, quantity, price, total_amount, notes } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO sales (user_id, customer_id, item_title, quantity, price, total_amount, status, sale_date, is_manual, notes)
         VALUES ($1, $2, $3, $4, $5, $6, 'completed', CURRENT_TIMESTAMP, true, $7) RETURNING *`,
        [req.userId, customer_id, item_title, quantity, price, total_amount, notes]
      );

      // Update customer stats
      await pool.query(`
        UPDATE customers
        SET lifetime_spent = lifetime_spent + $1,
            purchase_count = purchase_count + 1,
            average_ticket = lifetime_spent / purchase_count,
            is_return_customer = purchase_count > 1
        WHERE id = $2
      `, [total_amount, customer_id]);

      io.emit('sale_added', result.rows[0]);
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete sale
  router.delete('/:id', async (req, res) => {
    try {
      const result = await pool.query(
        'DELETE FROM sales WHERE id = $1 AND user_id = $2 RETURNING *',
        [req.params.id, req.userId]
      );
      io.emit('sale_deleted', result.rows[0]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
