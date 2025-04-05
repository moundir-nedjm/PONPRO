const mongoose = require('mongoose');
const Department = require('../src/models/Department');
const Employee = require('../src/models/Employee');
require('dotenv').config();

const createTestData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB...');

    // Check if department exists
    let department = await Department.findOne({ name: 'Département des Ressources Humaines' });
    
    if (!department) {
      // Create test department if it doesn't exist
      department = await Department.create({
        name: 'Département des Ressources Humaines',
        description: 'Gestion des ressources humaines',
        active: true,
        createdAt: new Date()
      });
      console.log('Department created:', department);
    } else {
      console.log('Department already exists:', department);
    }

    // Create test employees
    const employees = await Employee.create([
      {
        firstName: 'Mohammed',
        lastName: 'Benali',
        employeeId: 'EMP007',
        email: 'mohammed.benali3@example.com',
        phone: '0555123456',
        position: 'Directeur RH',
        department: department._id,
        hireDate: new Date('2024-01-01'),
        gender: 'male',
        birthDate: new Date('1980-05-15'),
        nationalId: '80123456',
        address: {
          street: '123 Rue de la Paix',
          city: 'Alger',
          wilaya: 'Alger',
          postalCode: '16000'
        }
      },
      {
        firstName: 'Fatima',
        lastName: 'Zahra',
        employeeId: 'EMP008',
        email: 'fatima.zahra3@example.com',
        phone: '0555789012',
        position: 'Responsable Formation',
        department: department._id,
        hireDate: new Date('2024-02-01'),
        gender: 'female',
        birthDate: new Date('1985-08-20'),
        nationalId: '85234567',
        address: {
          street: '45 Boulevard des Martyrs',
          city: 'Alger',
          wilaya: 'Alger',
          postalCode: '16000'
        }
      },
      {
        firstName: 'Karim',
        lastName: 'Boudiaf',
        employeeId: 'EMP009',
        email: 'karim.boudiaf3@example.com',
        phone: '0555345678',
        position: 'Assistant RH',
        department: department._id,
        hireDate: new Date('2024-03-01'),
        gender: 'male',
        birthDate: new Date('1990-12-10'),
        nationalId: '90345678',
        address: {
          street: '78 Rue Didouche Mourad',
          city: 'Alger',
          wilaya: 'Alger',
          postalCode: '16000'
        }
      }
    ]);

    console.log('Employees created:', employees);

    console.log('Test data creation completed successfully!');
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createTestData(); 