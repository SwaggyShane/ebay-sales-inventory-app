# Railway Deployment Guide for aquatics.narmir-reborn.com

## Step-by-Step Deployment Instructions

### 1. Connect Repository to Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Authorize Railway with your GitHub account
4. Select the `ebay-sales-inventory-app` repository
5. Click "Deploy"

Railway will automatically start building and deploying your app.

### 2. Configure Environment Variables

Once the project is created:

1. Go to your Railway project dashboard
2. Click on the "Variables" tab
3. Add the following environment variables:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/ebay_app
NODE_ENV=production
JWT_SECRET=your_random_secret_key_here_make_it_long
EBAY_APP_ID=your_ebay_app_id
EBAY_DEV_ID=your_ebay_dev_id
EBAY_AUTH_TOKEN=your_ebay_auth_token
```

**Important:** Generate a strong random string for `JWT_SECRET`. You can use:
```bash
openssl rand -base64 32
```

### 3. Set Up PostgreSQL Database

Railway provides a PostgreSQL plugin:

1. In your Railway project, click "Add" (+)
2. Select "PostgreSQL" from the available services
3. Railway automatically adds `DATABASE_URL` to your environment variables
4. The database is created and ready to use

**The schema will be created automatically** when the server starts (handled by `db-schema.js`).

### 4. Configure Custom Domain (aquatics.narmir-reborn.com)

1. In your Railway project, click on the "Networking" tab
2. Scroll to "Custom Domains"
3. Click "Add Custom Domain"
4. Enter: `aquatics.narmir-reborn.com`
5. Click "Add Domain"

Railway will provide DNS records you need to configure:

### 5. Update DNS Records

You need to update your DNS provider (likely Namecheap, GoDaddy, or similar) where `narmir-reborn.com` is registered:

1. Go to your domain registrar's DNS management panel
2. Add/update the DNS records Railway provides (usually an `A` record or `CNAME`)
3. Wait for DNS propagation (5-30 minutes typically)

**Common Railway DNS Setup:**
- Type: `CNAME`
- Name: `aquatics`
- Value: `<your-railway-project-url>` (provided by Railway)

OR

- Type: `A`
- Name: `aquatics`
- Value: `<railway-ip>` (provided by Railway)

### 6. Verify Deployment

Once DNS propagates:

1. Visit `https://aquatics.narmir-reborn.com`
2. You should see the login page
3. Create an account and test the features

### 7. Monitor Deployment

In Railway dashboard:

- **Deployments** tab: View build logs and deployment history
- **Logs** tab: Real-time server logs
- **Metrics** tab: Monitor CPU, memory, and network usage
- **Settings** tab: Manage environment variables and auto-deploy options

## Auto-Deploy on Push

Railway automatically redeploys when you push to `main` branch.

To push updates:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly in Variables
- Check PostgreSQL service is running in your Railway project
- View logs in Railway dashboard

### Build Failures
- Check the build logs in Railway Deployments tab
- Ensure `package.json` and `Procfile` are committed
- Verify Node.js version is compatible (18+)

### Domain Not Working
- Allow 30 minutes for DNS propagation
- Verify DNS records match Railway's requirements exactly
- Check Railway Custom Domains status shows "active"
- Clear browser cache and try incognito/private mode

### 500 Errors
- Check server logs in Railway Logs tab
- Verify JWT_SECRET is set
- Ensure eBay credentials are valid (if sync is failing)

## Disabling/Enabling Auto-Deploy

1. Go to Railway project Settings
2. Find "Auto-Deploy" option
3. Toggle on/off as needed

## Rollback to Previous Deployment

1. Go to Deployments tab
2. Click on a previous deployment
3. Click "Redeploy"

## Next Steps

1. **eBay API Integration**: Follow the in-app setup to configure your eBay credentials
2. **Start Using**: Add customers, track inventory, and record sales
3. **Monitor**: Check Railway metrics regularly to ensure app performance
4. **Scale**: If needed, upgrade Railway plan for more resources

## Support

- Railway Docs: https://docs.railway.app
- Railway Community: https://railway.app/support
- GitHub Repo: https://github.com/SwaggyShane/ebay-sales-inventory-app
