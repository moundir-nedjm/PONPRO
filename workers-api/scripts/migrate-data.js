/**
 * Data Migration Utility for Pointage API
 * 
 * This script exports data from MongoDB and transforms it for import into Cloudflare KV.
 * 
 * Usage:
 * 1. Run this script to export data from MongoDB to JSON files
 * 2. Use Wrangler to bulk import the JSON files into KV
 * 
 * Example:
 *   node migrate-data.js --output=./data
 *   wrangler kv:bulk put --binding=POINTAGE_DB --preview=false users.json
 */
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

// Configuration
const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pointage',
    dbName: process.env.MONGODB_DBNAME || 'pointage'
  },
  outputDir: process.env.OUTPUT_DIR || './data'
};

// Parse command line arguments
const args = process.argv.slice(2);
args.forEach(arg => {
  if (arg.startsWith('--output=')) {
    config.outputDir = arg.split('=')[1];
  }
  if (arg.startsWith('--mongodb-uri=')) {
    config.mongodb.uri = arg.split('=')[1];
  }
  if (arg.startsWith('--mongodb-dbname=')) {
    config.mongodb.dbName = arg.split('=')[1];
  }
});

// Ensure output directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// KV data format helpers
const formatForKV = (key, value) => ({
  key,
  value: JSON.stringify(value)
});

// Connect to MongoDB
async function connectToMongo() {
  console.log(`Connecting to MongoDB at ${config.mongodb.uri}...`);
  const client = new MongoClient(config.mongodb.uri);
  await client.connect();
  console.log('Connected to MongoDB');
  return client.db(config.mongodb.dbName);
}

// Export users
async function exportUsers(db) {
  console.log('Exporting users...');
  const users = await db.collection('users').find({}).toArray();
  const kvUsers = [];
  const emailIndex = [];
  
  for (const user of users) {
    // Convert MongoDB _id to string
    const id = user._id.toString();
    
    // Format user for KV
    const kvUser = {
      ...user,
      id,
      _id: undefined,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add user to KV array
    kvUsers.push(formatForKV(`user:${id}`, kvUser));
    
    // Add email index
    if (user.email) {
      emailIndex.push(formatForKV(`user:email:${user.email}`, id));
    }
  }
  
  // Write to files
  fs.writeFileSync(
    path.join(config.outputDir, 'users.json'),
    JSON.stringify(kvUsers, null, 2)
  );
  
  fs.writeFileSync(
    path.join(config.outputDir, 'user-email-index.json'),
    JSON.stringify(emailIndex, null, 2)
  );
  
  console.log(`Exported ${users.length} users`);
  return users;
}

// Export employees
async function exportEmployees(db) {
  console.log('Exporting employees...');
  const employees = await db.collection('employees').find({}).toArray();
  const kvEmployees = [];
  const employeeIds = [];
  
  for (const employee of employees) {
    // Convert MongoDB _id to string
    const id = employee._id.toString();
    employeeIds.push(id);
    
    // Format employee for KV
    const kvEmployee = {
      ...employee,
      id,
      _id: undefined,
      createdAt: employee.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add employee to KV array
    kvEmployees.push(formatForKV(`employee:${id}`, kvEmployee));
  }
  
  // Write to files
  fs.writeFileSync(
    path.join(config.outputDir, 'employees.json'),
    JSON.stringify(kvEmployees, null, 2)
  );
  
  fs.writeFileSync(
    path.join(config.outputDir, 'employee-ids.json'),
    JSON.stringify([formatForKV('employee:ids', employeeIds)], null, 2)
  );
  
  console.log(`Exported ${employees.length} employees`);
  return employees;
}

// Generate sample data
function generateSampleData() {
  console.log('Generating sample data...');
  
  // Sample admin user
  const adminUser = {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123', // Note: This should be hashed in production
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Sample employees
  const employees = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      position: 'Developer',
      departmentId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      position: 'Designer',
      departmentId: '2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  // Sample attendance records
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const attendance = [
    {
      id: '1',
      employeeId: '1',
      date: today.toISOString().split('T')[0],
      status: 'present',
      checkInTime: new Date(today.setHours(9, 0, 0)).toISOString(),
      checkOutTime: new Date(today.setHours(17, 0, 0)).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      employeeId: '2',
      date: today.toISOString().split('T')[0],
      status: 'present',
      checkInTime: new Date(today.setHours(9, 30, 0)).toISOString(),
      checkOutTime: new Date(today.setHours(17, 30, 0)).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      employeeId: '1',
      date: yesterday.toISOString().split('T')[0],
      status: 'present',
      checkInTime: new Date(yesterday.setHours(8, 45, 0)).toISOString(),
      checkOutTime: new Date(yesterday.setHours(16, 45, 0)).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  // Write sample data to files
  fs.writeFileSync(
    path.join(config.outputDir, 'users.json'),
    JSON.stringify([formatForKV(`user:${adminUser.id}`, adminUser)], null, 2)
  );
  
  fs.writeFileSync(
    path.join(config.outputDir, 'user-email-index.json'),
    JSON.stringify([formatForKV(`user:email:${adminUser.email}`, adminUser.id)], null, 2)
  );
  
  const kvEmployees = employees.map(emp => formatForKV(`employee:${emp.id}`, emp));
  fs.writeFileSync(
    path.join(config.outputDir, 'employees.json'),
    JSON.stringify(kvEmployees, null, 2)
  );
  
  fs.writeFileSync(
    path.join(config.outputDir, 'employee-ids.json'),
    JSON.stringify([formatForKV('employee:ids', employees.map(emp => emp.id))], null, 2)
  );
  
  const kvAttendance = attendance.map(att => formatForKV(`attendance:${att.id}`, att));
  fs.writeFileSync(
    path.join(config.outputDir, 'attendance.json'),
    JSON.stringify(kvAttendance, null, 2)
  );
  
  console.log('Sample data generated successfully');
}

// Generate import script
function generateImportScript() {
  console.log('Generating import script...');
  
  const scriptContent = `#!/bin/bash
# KV Import Script for Pointage API
# Generated: ${new Date().toISOString()}

# Replace these with your actual KV namespace IDs
KV_ID="YOUR_KV_NAMESPACE_ID"
KV_PREVIEW_ID="YOUR_KV_NAMESPACE_PREVIEW_ID"

# Import into production KV namespace
echo "Importing to production KV namespace..."
wrangler kv:bulk put --binding=POINTAGE_DB --namespace-id=$KV_ID users.json
wrangler kv:bulk put --binding=POINTAGE_DB --namespace-id=$KV_ID user-email-index.json
wrangler kv:bulk put --binding=POINTAGE_DB --namespace-id=$KV_ID employees.json
wrangler kv:bulk put --binding=POINTAGE_DB --namespace-id=$KV_ID employee-ids.json
wrangler kv:bulk put --binding=POINTAGE_DB --namespace-id=$KV_ID attendance.json

# Import into preview KV namespace
echo "Importing to preview KV namespace..."
wrangler kv:bulk put --binding=POINTAGE_DB --namespace-id=$KV_PREVIEW_ID users.json
wrangler kv:bulk put --binding=POINTAGE_DB --namespace-id=$KV_PREVIEW_ID user-email-index.json
wrangler kv:bulk put --binding=POINTAGE_DB --namespace-id=$KV_PREVIEW_ID employees.json
wrangler kv:bulk put --binding=POINTAGE_DB --namespace-id=$KV_PREVIEW_ID employee-ids.json
wrangler kv:bulk put --binding=POINTAGE_DB --namespace-id=$KV_PREVIEW_ID attendance.json

echo "Import complete!"
`;
  
  const scriptPath = path.join(config.outputDir, 'import.sh');
  fs.writeFileSync(scriptPath, scriptContent);
  
  // Make the script executable on Unix-based systems
  try {
    fs.chmodSync(scriptPath, '755');
  } catch (err) {
    // Skip if on Windows or if chmod fails
  }
  
  console.log(`Import script generated at ${scriptPath}`);
}

// Main function
async function main() {
  try {
    if (config.mongodb.uri.includes('localhost')) {
      console.log('Using MongoDB connection string with localhost. Assuming MongoDB is not available.');
      console.log('Generating sample data instead...');
      generateSampleData();
    } else {
      // Connect to MongoDB
      const db = await connectToMongo();
      
      // Export data
      await exportUsers(db);
      await exportEmployees(db);
      
      // Close MongoDB connection
      await db.client.close();
      console.log('MongoDB connection closed');
    }
    
    // Generate import script
    generateImportScript();
    
    console.log('\nData migration completed successfully!');
    console.log(`Output files are in: ${path.resolve(config.outputDir)}`);
    console.log('\nNext steps:');
    console.log('1. Verify the generated JSON files');
    console.log('2. Update the KV namespace IDs in the import.sh script');
    console.log('3. Run the import script to populate your KV namespace');
    
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 