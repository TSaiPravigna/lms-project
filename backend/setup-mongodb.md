# Setting up MongoDB Atlas for your LMS Project

This guide will help you set up a MongoDB Atlas account and get a connection string for your LMS project.

## Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Choose the "FREE" tier (M0) when creating a cluster

## Step 2: Create a Database User

1. In the MongoDB Atlas dashboard, go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter a username (e.g., "lmsuser") and password (e.g., "lmspassword")
5. Set the "Database User Privileges" to "Read and write to any database"
6. Click "Add User"

## Step 3: Configure Network Access

1. In the MongoDB Atlas dashboard, go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development purposes)
4. Click "Confirm"

## Step 4: Get Your Connection String

1. In the MongoDB Atlas dashboard, go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<username>`, `<password>`, and `<dbname>` with your actual values
   - Username: The database user you created (e.g., "lmsuser")
   - Password: The password you set for the database user (e.g., "lmspassword")
   - Dbname: The name of your database (e.g., "lms")

## Step 5: Update Your .env File

1. Open the `.env` file in your backend directory
2. Update the `MONGODB_URI` value with your connection string:

```
MONGODB_URI=mongodb+srv://lmsuser:lmspassword@cluster0.mongodb.net/lms?retryWrites=true&w=majority
```

## Step 6: Restart Your Backend Server

1. Stop your backend server if it's running
2. Start it again with `npm start` or `node server.js`

## Troubleshooting

If you still encounter connection issues:

1. Make sure your MongoDB Atlas cluster is fully deployed (it can take a few minutes)
2. Check that your IP address is allowed in the Network Access settings
3. Verify that your username and password are correct
4. Ensure your connection string is properly formatted

For more help, refer to the [MongoDB Atlas documentation](https://docs.atlas.mongodb.com/). 