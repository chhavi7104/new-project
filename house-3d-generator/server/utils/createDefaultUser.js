// utils/createDefaultUser.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function createDefaultUser() {
  try {
    // Check if default user already exists
    const existingUser = await User.findOne({ email: 'admin@example.com' });
    
    if (!existingUser) {
      // Create default user with hashed password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword
      });
      console.log('Default user created: admin@example.com / admin123');
    } else {
      console.log('Default user already exists');
    }
  } catch (error) {
    console.error('Error creating default user:', error);
  }
}

module.exports = createDefaultUser;