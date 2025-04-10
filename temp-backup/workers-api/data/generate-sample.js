/**
 * Sample Data Generator for Pointage API
 * 
 * This script generates sample data for the Cloudflare KV store.
 */
const fs = require('fs');
const path = require('path');

// KV data format helpers
const formatForKV = (key, value) => ({
  key,
  value: JSON.stringify(value)
});

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
    path.join(__dirname, 'users.json'),
    JSON.stringify([formatForKV(`user:${adminUser.id}`, adminUser)], null, 2)
  );
  
  fs.writeFileSync(
    path.join(__dirname, 'user-email-index.json'),
    JSON.stringify([formatForKV(`user:email:${adminUser.email}`, adminUser.id)], null, 2)
  );
  
  const kvEmployees = employees.map(emp => formatForKV(`employee:${emp.id}`, emp));
  fs.writeFileSync(
    path.join(__dirname, 'employees.json'),
    JSON.stringify(kvEmployees, null, 2)
  );
  
  fs.writeFileSync(
    path.join(__dirname, 'employee-ids.json'),
    JSON.stringify([formatForKV('employee:ids', employees.map(emp => emp.id))], null, 2)
  );
  
  const kvAttendance = attendance.map(att => formatForKV(`attendance:${att.id}`, att));
  fs.writeFileSync(
    path.join(__dirname, 'attendance.json'),
    JSON.stringify(kvAttendance, null, 2)
  );

  // Generate import script
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
  
  const scriptPath = path.join(__dirname, 'import.sh');
  fs.writeFileSync(scriptPath, scriptContent);
  
  // Make the script executable on Unix-based systems
  try {
    fs.chmodSync(scriptPath, '755');
  } catch (err) {
    // Skip if on Windows or if chmod fails
  }
  
  console.log('Sample data generated successfully');
  console.log('\nSample data files created:');
  console.log('- users.json');
  console.log('- user-email-index.json');
  console.log('- employees.json');
  console.log('- employee-ids.json');
  console.log('- attendance.json');
  console.log('- import.sh');
  console.log('\nNext steps:');
  console.log('1. Create KV namespaces using wrangler:');
  console.log('   wrangler kv:namespace create "POINTAGE_DB"');
  console.log('   wrangler kv:namespace create "POINTAGE_DB" --preview');
  console.log('2. Update the KV namespace IDs in:');
  console.log('   - wrangler.toml');
  console.log('   - import.sh');
  console.log('3. Run the import script:');
  console.log('   chmod +x import.sh && ./import.sh');
}

// Run the generation
generateSampleData(); 