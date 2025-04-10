const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const Department = require('./models/Department');
const AttendanceCode = require('./models/AttendanceCode');

// Sample departments data
const departments = [
  { name: 'Direction', description: 'Direction générale' },
  { name: 'Ressources Humaines', description: 'Gestion des ressources humaines' },
  { name: 'Finance', description: 'Comptabilité et finance' },
  { name: 'Informatique', description: 'Service informatique' },
  { name: 'Marketing', description: 'Marketing et communication' },
  { name: 'Production', description: 'Service de production' },
  { name: 'Logistique', description: 'Logistique et approvisionnement' }
];

// Sample employee positions
const positions = [
  'Directeur', 'Manager', 'Responsable', 'Assistant', 'Technicien', 'Ingénieur', 
  'Analyste', 'Comptable', 'Développeur', 'Designer', 'Administrateur', 'Agent'
];

// Function to generate a random employee
const generateEmployee = (index, departmentId, departmentName) => {
  const firstName = `Prénom${index}`;
  const lastName = `Nom${index}`;
  const position = positions[Math.floor(Math.random() * positions.length)];
  
  return {
    employeeId: `EMP${index.toString().padStart(4, '0')}`,
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    phone: `+33 6 ${Math.floor(10000000 + Math.random() * 90000000)}`,
    position: `${position} ${departmentName}`,
    department: departmentId,
    departmentName,
    active: true,
    biometricStatus: {
      faceRecognition: { 
        status: Math.random() > 0.7 ? 'completed' : Math.random() > 0.3 ? 'in_progress' : 'not_started',
        samplesCount: Math.floor(Math.random() * 10)
      },
      fingerprint: { 
        status: Math.random() > 0.7 ? 'completed' : Math.random() > 0.3 ? 'in_progress' : 'not_started',
        samplesCount: Math.floor(Math.random() * 10)
      }
    }
  };
};

const seedAttendanceCodes = async () => {
  try {
    const count = await AttendanceCode.countDocuments();
    
    if (count > 0) {
      console.log('Attendance codes already exist. Skipping seed.');
      return;
    }
    
    console.log('Seeding attendance codes...');
    
    // Define default attendance codes
    const defaultCodes = [
      {
        code: 'P',
        description: 'Présent toute la journée',
        category: 'present',
        color: '#4CAF50', // Green
        influencer: false,
        paymentImpact: 'full-pay'
      },
      {
        code: 'A',
        description: 'Absent non justifié',
        category: 'absent',
        color: '#F44336', // Red
        influencer: true,
        paymentImpact: 'no-pay'
      },
      {
        code: 'AM',
        description: 'Absent pour raison médicale',
        category: 'absent',
        color: '#FF9800', // Orange
        influencer: true,
        paymentImpact: 'partial-pay'
      },
      {
        code: 'CP',
        description: 'Congé payé',
        category: 'leave',
        color: '#2196F3', // Blue
        influencer: false,
        paymentImpact: 'full-pay'
      },
      {
        code: 'JF',
        description: 'Jour férié',
        category: 'holiday',
        color: '#9C27B0', // Purple
        influencer: false,
        paymentImpact: 'full-pay'
      },
      {
        code: 'RT',
        description: 'Retard',
        category: 'present',
        color: '#FFC107', // Amber
        influencer: true,
        paymentImpact: 'partial-pay'
      },
      {
        code: 'FT',
        description: 'Formation',
        category: 'other',
        color: '#03A9F4', // Light Blue
        influencer: false,
        paymentImpact: 'full-pay'
      }
    ];
    
    // Insert the codes
    await AttendanceCode.insertMany(defaultCodes);
    console.log(`${defaultCodes.length} attendance codes seeded successfully`);
  } catch (error) {
    console.error('Error seeding attendance codes:', error);
  }
};

// Function to seed the database
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Check for existing departments
    const existingDeptCount = await Department.countDocuments();
    console.log(`Found ${existingDeptCount} existing departments`);
    
    let deptIds = [];
    
    // If no departments exist, create them
    if (existingDeptCount === 0) {
      console.log('Creating departments...');
      const createdDepts = await Department.insertMany(departments);
      deptIds = createdDepts.map(dept => ({
        _id: dept._id,
        name: dept.name
      }));
      console.log(`Created ${createdDepts.length} departments`);
    } else {
      // Get existing department IDs
      const existingDepts = await Department.find();
      deptIds = existingDepts.map(dept => ({
        _id: dept._id,
        name: dept.name
      }));
    }
    
    // Check for existing employees
    const existingEmpCount = await Employee.countDocuments();
    console.log(`Found ${existingEmpCount} existing employees`);
    
    // If fewer than 20 employees exist, create more
    if (existingEmpCount < 20) {
      console.log('Creating employees...');
      
      const employeesToCreate = [];
      const employeesToAdd = 20 - existingEmpCount;
      
      for (let i = 0; i < employeesToAdd; i++) {
        const deptIndex = Math.floor(Math.random() * deptIds.length);
        const deptId = deptIds[deptIndex]._id;
        const deptName = deptIds[deptIndex].name;
        const employee = generateEmployee(existingEmpCount + i + 1, deptId, deptName);
        employeesToCreate.push(employee);
      }
      
      await Employee.insertMany(employeesToCreate);
      console.log(`Created ${employeesToCreate.length} new employees`);
    }
    
    await seedAttendanceCodes();
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Export the seed function
module.exports = seedDatabase; 