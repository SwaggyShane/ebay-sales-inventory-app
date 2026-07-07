import express from 'express';
import { verifyAuth } from './middleware.js';

export default function inventoryRoutes(pool, io) {
  const router = express.Router();

  router.use(verifyAuth);

  // Get all inventory
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM inventory WHERE user_id = $1',
        [req.userId]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get inventory by type
  router.get('/:type', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM inventory WHERE user_id = $1 AND item_type = $2',
        [req.userId, req.params.type]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Set inventory (manual update)
  router.post('/set/:type', async (req, res) => {
    const { quantity, reason } = req.body;
    try {
      let result = await pool.query(
        'SELECT * FROM inventory WHERE user_id = $1 AND item_type = $2',
        [req.userId, req.params.type]
      );

      let inventory;
      if (result.rows.length === 0) {
        result = await pool.query(
          'INSERT INTO inventory (user_id, item_type, quantity, last_manual_update) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *',
          [req.userId, req.params.type, quantity]
        );
        inventory = result.rows[0];
      } else {
        const oldQty = result.rows[0].quantity;
        result = await pool.query(
          'UPDATE inventory SET quantity = $1, last_manual_update = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
          [quantity, result.rows[0].id]
        );
        inventory = result.rows[0];

        await pool.query(
          'INSERT INTO inventory_adjustments (user_id, inventory_id, adjustment_type, quantity_change, reason) VALUES ($1, $2, $3, $4, $5)',
          [req.userId, inventory.id, 'manual', quantity - oldQty, reason || 'Manual update']
        );
      }

      io.emit('inventory_updated', inventory);
      res.json(inventory);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Adjust inventory
  router.post('/adjust/:type', async (req, res) => {
    const { quantity_change, reason } = req.body;
    try {
      let result = await pool.query(
        'SELECT * FROM inventory WHERE user_id = $1 AND item_type = $2',
        [req.userId, req.params.type]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }

      const current = result.rows[0];
      const newQty = current.quantity + quantity_change;

      result = await pool.query(
        'UPDATE inventory SET quantity = $1 WHERE id = $2 RETURNING *',
        [newQty, current.id]
      );

      await pool.query(
        'INSERT INTO inventory_adjustments (user_id, inventory_id, adjustment_type, quantity_change, reason) VALUES ($1, $2, $3, $4, $5)',
        [req.userId, current.id, 'adjustment', quantity_change, reason || 'Inventory adjustment']
      );

      io.emit('inventory_updated', result.rows[0]);
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get inventory adjustment history
  router.get('/history/:type', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT ia.* FROM inventory_adjustments ia
        JOIN inventory i ON ia.inventory_id = i.id
        WHERE ia.user_id = $1 AND i.item_type = $2
        ORDER BY ia.created_at DESC
      `, [req.userId, req.params.type]);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
