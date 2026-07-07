# eBay Sales & Inventory Manager

A full-stack web application for managing eBay sales, tracking customers, and monitoring inventory levels in real-time.

## Features

- **Sales Tracking**: Record and filter eBay sales with customer details, item information, and transaction amounts
- **Customer Management**: Track customer purchase history, lifetime spending, average ticket price, and repeat customer status
- **Customer Discussions**: Keep notes on customer interactions, promises, and commitments with multiple note types (general, promise, issue)
- **Inventory Management**: Track inventory for multiple product types (Purple and Magenta Mystery Snails) with manual updates and automatic adjustments from sales
- **eBay Integration**: Configure your eBay API credentials and sync sales data automatically
- **Real-Time Updates**: WebSocket support for instant updates across connected clients
- **Dashboard**: View key metrics including total sales, revenue, average ticket, and unique customer count

## Tech Stack

### Backend
- **Node.js** with Express.js server
- **PostgreSQL** for data persistence
- **Socket.io** for real-time WebSocket communication
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Axios** for eBay API calls

### Frontend
- **React 18** with Vite bundler
- **Zustand** for state management with localStorage persistence
- **Tailwind CSS** for responsive UI styling
- **ES Modules** for modern JavaScript

## Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SwaggyShane/ebay-sales-inventory-app.git
   cd ebay-sales-inventory-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/ebay_app
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_here
   EBAY_APP_ID=your_ebay_app_id
   EBAY_DEV_ID=your_ebay_dev_id
   EBAY_AUTH_TOKEN=your_ebay_auth_token
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Using Docker (recommended)
   docker run --name postgres-ebay -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15
   docker exec postgres-ebay psql -U postgres -c "CREATE DATABASE ebay_app;"
   
   # Or using system PostgreSQL
   createdb ebay_app
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   
   The server will start on `http://localhost:3001` and the Vite dev server will proxy API calls.

## Available Scripts

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Database Schema

The application uses 7 PostgreSQL tables:

- **users**: User accounts and authentication
- **customers**: eBay customer information and statistics
- **sales**: Transaction records
- **inventory**: Product stock levels
- **inventory_adjustments**: Audit trail for inventory changes
- **customer_notes**: Discussion notes and commitments
- **ebay_sync_log**: History of eBay API sync operations

All tables are automatically created on server startup.

## API Routes

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Log in to account
- `GET /api/auth/me` - Get current user

### Customers
- `GET /api/customers` - List customers with filtering and sorting
- `GET /api/customers/:id` - Get customer details
- `GET /api/customers/:id/sales` - Get customer sales history
- `GET /api/customers/:id/notes` - Get customer notes
- `POST /api/customers/:id/notes` - Add customer note
- `PATCH /api/customers/:id/notes/:noteId` - Update customer note
- `POST /api/customers` - Add manual customer

### Sales
- `GET /api/sales` - List sales with filtering
- `GET /api/sales/stats/summary` - Get sales statistics
- `POST /api/sales` - Add manual sale
- `DELETE /api/sales/:id` - Delete sale

### Inventory
- `GET /api/inventory` - List all inventory
- `GET /api/inventory/:type` - Get inventory for item type
- `POST /api/inventory/set/:type` - Manually set inventory quantity
- `POST /api/inventory/adjust/:type` - Adjust inventory by amount
- `GET /api/inventory/history/:type` - Get adjustment history

### eBay Sync
- `POST /api/ebay/configure` - Configure eBay API credentials
- `POST /api/ebay/sync` - Start eBay sync process
- `GET /api/ebay/sync/history` - Get sync history

## Deployment to Railway

For detailed step-by-step instructions, see [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

**Quick Start:**

1. Push to GitHub
2. Connect repo to [railway.app](https://railway.app)
3. Add PostgreSQL database (Railway plugin)
4. Configure environment variables (JWT_SECRET, eBay credentials)
5. Set custom domain: `aquatics.narmir-reborn.com`
6. Update DNS records at your domain registrar
7. Deploy — Railway auto-deploys on push to main

**Custom Domain Setup:**
- Railway provides DNS records
- Add CNAME or A record to your DNS provider pointing to Railway
- Wait for DNS propagation (5-30 minutes)
- Visit `https://aquatics.narmir-reborn.com`

## Security Considerations

- All API routes require JWT authentication (except `/auth/register` and `/auth/login`)
- Passwords are hashed with bcryptjs (10 salt rounds)
- SQL queries use parameterized queries to prevent injection
- JWT tokens are stored in httpOnly cookies and localStorage
- User data is scoped by `user_id` in all queries

## Development Notes

- Backend runs on port 3001 (Express + Socket.io)
- Frontend Vite dev server proxies `/api` and `/socket.io` to backend
- Database migrations run automatically on server startup
- Real-time updates via Socket.io for inventory and sales changes

## Support & Issues

For bugs or feature requests, please open an issue on GitHub: https://github.com/SwaggyShane/ebay-sales-inventory-app/issues

## License

MIT
