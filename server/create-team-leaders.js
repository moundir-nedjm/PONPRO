const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const Department = require('./models/Department');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/poinpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Chef d'équipe credentials from the login form
const chefCredentials = [
  { 
    type: 'Admin', 
    email: 'admin@poinpro.com', 
    password: 'admin123', 
    departmentName: 'KBK FROID', // Assigning a department to admin 
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User'
  },
  { type: 'Adm HBK', email: 'adm.hbk@poinpro.com', password: 'admhbk123', departmentName: 'KBK ELEC', role: 'admin' },
  { type: 'Adm Setif', email: 'adm.setif@poinpro.com', password: 'admsetif123', departmentName: 'ADM SETIF', role: 'admin' },
  { type: 'Chef KBK FROID', email: 'kbk@poinpro.com', password: 'kbk123', departmentName: 'KBK FROID', role: 'chef' },
  { type: 'Chef HBK ELEC', email: 'hbk@poinpro.com', password: 'hbk123', departmentName: 'KBK ELEC', role: 'chef' },
  { type: 'Chef HML', email: 'hml@poinpro.com', password: 'hml123', departmentName: 'HML', role: 'chef' },
  { type: 'Chef REB', email: 'reb@poinpro.com', password: 'reb123', departmentName: 'REB', role: 'chef' },
  { type: 'Chef DEG', email: 'deg@poinpro.com', password: 'deg123', departmentName: 'DEG', role: 'chef' },
  { type: 'Chef HAMRA', email: 'hamra@poinpro.com', password: 'hamra123', departmentName: 'HAMRA', role: 'chef' },
  { 
    type: 'Employee', 
    email: 'employee@poinpro.com', 
    password: 'employee123', 
    departmentName: 'KBK FROID', 
    role: 'employee',
    firstName: 'Regular',
    lastName: 'Employee'
  }
];

// Create chef accounts with appropriate department associations
async function createChefAccounts() {
  try {
    let created = 0;
    let updated = 0;
    let errors = 0;

    // Process each chef credential
    for (const chef of chefCredentials) {
      try {
        // Check if user already exists
        let existingUser = await Employee.findOne({ email: chef.email });
        
        // Find department if specified
        let departmentId = null;
        if (chef.departmentName) {
          const department = await Department.findOne({ name: chef.departmentName });
          if (department) {
            departmentId = department._id;
          } else {
            console.log(`Department not found: ${chef.departmentName}`);
            errors++;
            continue;
          }
        }
        
        if (existingUser) {
          // Update existing user
          existingUser.role = chef.role;
          if (departmentId) {
            existingUser.department = departmentId;
            existingUser.departmentName = chef.departmentName;
          }
          
          await existingUser.save();
          updated++;
          console.log(`Updated: ${chef.email} (${chef.type})`);
        } else {
          // Create new user
          const newUser = new Employee({
            employeeId: `CHEF${Math.floor(1000 + Math.random() * 9000)}`,
            firstName: chef.firstName || chef.type.split(' ')[0],
            lastName: chef.lastName || chef.type.split(' ')[1] || '',
            email: chef.email,
            password: chef.password, // In production, this should be hashed
            role: chef.role,
            position: chef.type,
            active: true,
            phone: `+213 5${Math.floor(10000000 + Math.random() * 90000000)}`,
            hireDate: new Date(),
            biometricStatus: {
              faceRecognition: {
                status: 'not_started',
                samplesCount: 0
              },
              fingerprint: {
                status: 'not_started',
                samplesCount: 0
              }
            }
          });
          
          // Assign department if specified
          if (departmentId) {
            newUser.department = departmentId;
            newUser.departmentName = chef.departmentName;
          }
          
          await newUser.save();
          created++;
          console.log(`Created: ${chef.email} (${chef.type})`);
        }
      } catch (error) {
        console.error(`Error processing ${chef.email}:`, error.message);
        errors++;
      }
    }
    
    console.log('=== Summary ===');
    console.log(`Created: ${created} users`);
    console.log(`Updated: ${updated} users`);
    console.log(`Errors: ${errors}`);
    
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error creating chef accounts:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}

// Run the function
createChefAccounts(); 