# Installing MongoDB Locally for your LMS Project

This guide will help you install MongoDB locally on your Windows system.

## Option 1: Install MongoDB Community Edition

1. Download the MongoDB Community Server installer from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the installation wizard
3. Choose "Complete" installation type
4. Install MongoDB Compass (the GUI tool) when prompted
5. Complete the installation

## Option 2: Use MongoDB as a Service (Easier)

1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Choose "Custom" installation type
4. Make sure "Install MongoDB as a Service" is checked
5. Complete the installation

## Verify Installation

1. Open Command Prompt as Administrator
2. Run the following command to check if MongoDB is running:
   ```
   sc query MongoDB
   ```
3. If MongoDB is running, you should see "RUNNING" in the output

## Start MongoDB (if not running as a service)

1. Open Command Prompt as Administrator
2. Run the following command to start MongoDB:
   ```
   net start MongoDB
   ```

## Connect to MongoDB

1. Open MongoDB Compass
2. Use the connection string: `mongodb://localhost:27017`
3. Click "Connect"

## Update Your .env File

1. Open the `.env` file in your backend directory
2. Update the `MONGODB_URI` value to use the local MongoDB:

```
MONGODB_URI=mongodb://localhost:27017/lms
```

## Restart Your Backend Server

1. Stop your backend server if it's running
2. Start it again with `npm start` or `node server.js`

## Troubleshooting

If you encounter issues:

1. Make sure MongoDB is running (check Services in Windows)
2. Verify that the MongoDB port (27017) is not blocked by a firewall
3. Check that the MongoDB data directory exists and has proper permissions

For more help, refer to the [MongoDB documentation](https://docs.mongodb.com/manual/). 