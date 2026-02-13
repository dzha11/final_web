require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Inline User schema (avoid circular imports)
const userSchema = new mongoose.Schema({
  username: String,
  email:    { type: String, unique: true },
  password: String,
  role:     { type: String, default: 'user' },
  avatar:   { type: String, default: '' },
  bio:      { type: String, default: '' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  const args = process.argv.slice(2);

  // --promote mode: make an existing user admin by email
  if (args[0] === '--promote' && args[1]) {
    const email = args[1];
    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
    if (!user) {
      console.log(`No user found with email: ${email}`);
    } else {
      console.log(`User "${user.username}" (${email}) is now an admin!`);
    }
    await mongoose.disconnect();
    rl.close();
    return;
  }

  // Interactive mode: create a brand-new admin
  console.log('   HabitFlow — Create Admin User   ');
  

  const username = await ask('Username: ');
  const email    = await ask('Email: ');
  const password = await ask('Password (min 6 chars): ');

  if (!username || !email || !password) {
    console.log('All fields are required');
    await mongoose.disconnect();
    rl.close();
    return;
  }

  if (password.length < 6) {
    console.log('❌ Password must be at least 6 characters');
    await mongoose.disconnect();
    rl.close();
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`❌ Email "${email}" is already registered`);
    await mongoose.disconnect();
    rl.close();
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const admin  = await User.create({ username, email, password: hashed, role: 'admin' });

  console.log('\n✅ Admin created successfully!');
  console.log(`   Username : ${admin.username}`);
  console.log(`   Email    : ${admin.email}`);
  console.log(`   Role     : ${admin.role}`);
  console.log('\nYou can now log in at the app with these credentials.\n');

  await mongoose.disconnect();
  rl.close();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
