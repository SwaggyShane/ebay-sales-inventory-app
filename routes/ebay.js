import express from 'express';
import { verifyAuth } from './middleware.js';
import axios from 'axios';

export default function ebayRoutes(pool) {
  const router = express.Router();

  router.use(verifyAuth);

  // Sync sales from eBay
  router.post('/sync', async (req, res) => {
    try {
      const logResult = await pool.query(
        'INSERT INTO ebay_sync_log (user_id, sync_type, status, items_synced) VALUES ($1, $2, $3, $4) RETURNING *',
        [req.userId, 'full_sync', 'pending', 0]
      );

      res.json({
        message: 'Sync started',
        syncLogId: logResult.rows[0].id,
        status: 'pending'
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get eBay sync history
  router.get('/sync/history', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM ebay_sync_log WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
        [req.userId]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Configure eBay credentials
  router.post('/configure', async (req, res) => {
    const { authToken } = req.body;
    try {
      if (!authToken || authToken.length < 10) {
        return res.status(400).json({ error: 'Invalid auth token' });
      }
      res.json({ message: 'eBay credentials configured' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
