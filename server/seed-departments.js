const mongoose = require('mongoose');
const Department = require('./models/Department');

const mockDepts = [
  { name: 'KBK FROID', description: 'Département de réfrigération et systèmes frigorifiques', active: true },
  { name: 'KBK ELEC', description: 'Département d\'électricité et systèmes électriques', active: true },
  { name: 'HML', description: 'Opérations et services HML', active: true },
  { name: 'REB', description: 'Services et développement REB', active: true },
  { name: 'DEG', description: 'Gestion et opérations DEG', active: true },
  { name: 'HAMRA', description: 'Division HAMRA et services associés', active: false },
  { name: 'ADM SETIF', description: 'Administration de la région de Sétif', active: true },
  { name: 'ADM HMD', description: 'Administration de la région HMD', active: true }
];

async function seedDepartments() {
  try {
    await mongoose.connect('mongodb://localhost:27017/poinpro');
    console.log('Connected to MongoDB');
    
    // First check if departments exist
    const existingDepts = await Department.find();
    console.log('Existing departments:', existingDepts.length);
    
    // Insert departments that don't exist yet
    const newDepts = [];
    for (const dept of mockDepts) {
      const exists = await Department.findOne({ name: dept.name });
      if (!exists) {
        newDepts.push(dept);
      }
    }
    
    if (newDepts.length > 0) {
      console.log(`Adding ${newDepts.length} new departments`);
      const result = await Department.insertMany(newDepts);
      console.log('Added successfully:', result.length);
    } else {
      console.log('No new departments to add');
    }
    
    // Get final list
    const allDepts = await Department.find();
    console.log('Total departments now:', allDepts.length);
    console.log('Department names:', allDepts.map(d => d.name));
    
    mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding departments:', error);
    mongoose.disconnect();
  }
}

seedDepartments(); 