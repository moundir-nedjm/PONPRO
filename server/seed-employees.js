const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const Department = require('./models/Department');

const sampleEmployees = [
  {
    employeeId: 'EMP001',
    firstName: 'Ahmed',
    lastName: 'Benali',
    email: 'ahmed.benali@example.com',
    phone: '0556789012',
    position: 'Technicien',
    hireDate: new Date('2022-05-15'),
    birthDate: new Date('1988-08-22'),
    gender: 'male',
    address: '15 Rue des Oliviers, Alger',
    salary: 85000,
    active: true
  },
  {
    employeeId: 'EMP002',
    firstName: 'Fatima',
    lastName: 'Zahra',
    email: 'fatima.zahra@example.com',
    phone: '0661234567',
    position: 'Ingénieur',
    hireDate: new Date('2021-03-10'),
    birthDate: new Date('1992-04-18'),
    gender: 'female',
    address: '8 Boulevard Mohamed V, Oran',
    salary: 95000,
    active: true
  },
  {
    employeeId: 'EMP003',
    firstName: 'Mohammed',
    lastName: 'Kaci',
    email: 'mohammed.kaci@example.com',
    phone: '0770123456',
    position: 'Responsable',
    hireDate: new Date('2020-11-05'),
    birthDate: new Date('1985-12-10'),
    gender: 'male',
    address: '25 Rue Didouche Mourad, Constantine',
    salary: 120000,
    active: true
  },
  {
    employeeId: 'EMP004',
    firstName: 'Amina',
    lastName: 'Hadj',
    email: 'amina.hadj@example.com',
    phone: '0550987654',
    position: 'Assistante',
    hireDate: new Date('2023-01-20'),
    birthDate: new Date('1995-07-30'),
    gender: 'female',
    address: '5 Rue des Frères Bouadou, Tizi Ouzou',
    salary: 70000,
    active: true
  },
  {
    employeeId: 'EMP005',
    firstName: 'Karim',
    lastName: 'Boudiaf',
    email: 'karim.boudiaf@example.com',
    phone: '0660765432',
    position: 'Analyste',
    hireDate: new Date('2021-08-15'),
    birthDate: new Date('1990-03-12'),
    gender: 'male',
    address: '12 Boulevard Zighout Youcef, Annaba',
    salary: 90000,
    active: true
  }
];

async function seedEmployees() {
  try {
    await mongoose.connect('mongodb://localhost:27017/poinpro');
    console.log('Connected to MongoDB');
    
    // Get all departments
    const departments = await Department.find();
    if (departments.length === 0) {
      console.log('No departments found. Please run seed-departments.js first.');
      mongoose.disconnect();
      return;
    }
    
    // First check if employees already exist
    const existingEmployees = await Employee.find();
    console.log('Existing employees:', existingEmployees.length);
    
    if (existingEmployees.length > 0) {
      console.log('Database already has employees, skipping seeding.');
      mongoose.disconnect();
      return;
    }
    
    // Assign each employee to a different department
    const employeesWithDepartments = sampleEmployees.map((emp, index) => {
      const departmentId = departments[index % departments.length]._id;
      return {
        ...emp,
        department: departmentId
      };
    });
    
    // Insert employees
    const result = await Employee.insertMany(employeesWithDepartments);
    console.log(`Added ${result.length} employees successfully`);
    
    // Get all employees to confirm
    const allEmployees = await Employee.find().populate('department');
    console.log('Total employees now:', allEmployees.length);
    console.log('Employees with departments:', 
      allEmployees.map(e => ({
        employeeId: e.employeeId,
        name: `${e.firstName} ${e.lastName}`,
        department: e.department ? e.department.name : 'None'
      }))
    );
    
    mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding employees:', error);
    mongoose.disconnect();
  }
}

seedEmployees(); 