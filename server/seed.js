const mongoose = require('mongoose');
const Employee = require('./models/Employee');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/poinpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Sample employee data
const sampleEmployees = [
  {
    employeeId: 'EMP001',
    firstName: 'Ahmed',
    lastName: 'Benali',
    email: 'ahmed.benali@example.com',
    phone: '+213 555 123 456',
    position: 'Développeur Senior',
    department: { name: 'Informatique' },
    hireDate: '2020-05-15',
    active: true,
    biometricStatus: {
      faceRecognition: {
        status: 'completed',
        samplesCount: 3
      },
      fingerprint: {
        status: 'not_started',
        samplesCount: 0
      }
    }
  },
  {
    employeeId: 'EMP002',
    firstName: 'Fatima',
    lastName: 'Zahra',
    email: 'fatima.zahra@example.com',
    phone: '+213 555 789 012',
    position: 'Responsable RH',
    department: { name: 'Ressources Humaines' },
    hireDate: '2019-03-10',
    active: true,
    biometricStatus: {
      faceRecognition: {
        status: 'validated',
        samplesCount: 5
      },
      fingerprint: {
        status: 'validated',
        samplesCount: 3
      }
    }
  },
  {
    employeeId: 'EMP003',
    firstName: 'Mohammed',
    lastName: 'Kaci',
    email: 'mohammed.kaci@example.com',
    phone: '+213 555 345 678',
    position: 'Comptable',
    department: { name: 'Finance' },
    hireDate: '2021-01-20',
    active: true,
    biometricStatus: {
      faceRecognition: {
        status: 'in_progress',
        samplesCount: 1
      },
      fingerprint: {
        status: 'not_started',
        samplesCount: 0
      }
    }
  },
  {
    employeeId: 'EMP004',
    firstName: 'Amina',
    lastName: 'Hadj',
    email: 'amina.hadj@example.com',
    phone: '+213 555 901 234',
    position: 'Directrice Marketing',
    department: { name: 'Marketing' },
    hireDate: '2018-11-05',
    active: true,
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
  },
  {
    employeeId: 'EMP005',
    firstName: 'Karim',
    lastName: 'Boudiaf',
    email: 'karim.boudiaf@example.com',
    phone: '+213 555 567 890',
    position: 'Technicien',
    department: { name: 'Production' },
    hireDate: '2022-02-15',
    active: false,
    biometricStatus: {
      faceRecognition: {
        status: 'rejected',
        samplesCount: 2
      },
      fingerprint: {
        status: 'in_progress',
        samplesCount: 1
      }
    }
  }
];

// Seed the database
const seedDB = async () => {
  try {
    // Clear existing data
    await Employee.deleteMany({});
    console.log('Database cleared');
    
    // Insert sample data
    await Employee.insertMany(sampleEmployees);
    console.log('Database seeded with sample data');
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDB(); 