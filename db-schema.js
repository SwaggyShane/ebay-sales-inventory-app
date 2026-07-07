// Database schema and initialization
import pg from 'pg';

export async function initializeDatabase(pool) {
  const client = await pool.connect();
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Customers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ebay_user_id VARCHAR(255),
        ebay_username VARCHAR(255),
        lifetime_spent DECIMAL(10, 2) DEFAULT 0,
        purchase_count INTEGER DEFAULT 0,
        average_ticket DECIMAL(10, 2) DEFAULT 0,
        is_return_customer BOOLEAN DEFAULT FALSE,
        notes TEXT,
        last_purchase_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, ebay_user_id)
      )
    `);

    // Sales table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        customer_id INTEGER REFERENCES customers(id),
        ebay_transaction_id VARCHAR(255),
        ebay_order_id VARCHAR(255),
        item_title VARCHAR(500),
        quantity INTEGER DEFAULT 1,
        price DECIMAL(10, 2),
        total_amount DECIMAL(10, 2),
        status VARCHAR(50),
        sale_date TIMESTAMP,
        shipped_date TIMESTAMP,
        is_manual BOOLEAN DEFAULT FALSE,
        notes TEXT,
        synced_from_ebay BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, ebay_transaction_id)
      )
    `);

    // Inventory table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        item_type VARCHAR(100),
        quantity INTEGER DEFAULT 0,
        reserved_quantity INTEGER DEFAULT 0,
        last_manual_update TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, item_type)
      )
    `);

    // Inventory adjustments log
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory_adjustments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        inventory_id INTEGER REFERENCES inventory(id),
        adjustment_type VARCHAR(50),
        quantity_change INTEGER,
        reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Customer notes
    await client.query(`
      CREATE TABLE IF NOT EXISTS customer_notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        customer_id INTEGER REFERENCES customers(id),
        content TEXT,
        note_type VARCHAR(50),
        is_resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // eBay sync log
    await client.query(`
      CREATE TABLE IF NOT EXISTS ebay_sync_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        sync_type VARCHAR(50),
        status VARCHAR(50),
        items_synced INTEGER,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✓ Database schema initialized');
  } finally {
    client.release();
  }
}
