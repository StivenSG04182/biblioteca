import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const users = [
  {
    email: 'biblioteca9101@sena.edu.co',
    password: '123456'
  },
  {
    email: 'stivensg04182@gmail.com',
    password: '987654'
  }
];

async function addUsers() {
  try {
    for (const user of users) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      // Insert user
      const result = await query(
        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
        [user.email, hashedPassword]
      );

      // Add default settings
      await query(
        'INSERT INTO user_settings (user_id, dark_mode, voice_enabled) VALUES ($1, $2, $3)',
        [result.rows[0].id, true, true]
      );

      console.log(`Added user: ${user.email}`);
    }

    console.log('All users added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error adding users:', error);
    process.exit(1);
  }
}

addUsers();