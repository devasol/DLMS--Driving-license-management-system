import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkExistingData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check existing users and their data
    const users = await User.find({}, 'fullName full_name email user_email user_name nic').limit(20);
    
    console.log('\n📋 Existing Users in Database:');
    console.log('='.repeat(80));
    
    const nicNumbers = new Set();
    const userNames = new Set();
    const emails = new Set();
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName || user.full_name || 'No Name'}`);
      console.log(`   Email: ${user.email || user.user_email || 'No Email'}`);
      console.log(`   Username: ${user.user_name || 'No Username'}`);
      console.log(`   NIC: ${user.nic || 'No NIC'}`);
      console.log('   ---');
      
      if (user.nic) nicNumbers.add(user.nic);
      if (user.user_name) userNames.add(user.user_name);
      if (user.email || user.user_email) emails.add(user.email || user.user_email);
    });

    console.log('\n📊 Summary:');
    console.log(`Total Users: ${users.length}`);
    console.log(`Unique NICs: ${nicNumbers.size}`);
    console.log(`Unique Usernames: ${userNames.size}`);
    console.log(`Unique Emails: ${emails.size}`);

    console.log('\n🔍 Taken NIC Numbers:');
    Array.from(nicNumbers).forEach(nic => console.log(`- ${nic}`));

    console.log('\n🔍 Taken Usernames:');
    Array.from(userNames).forEach(username => console.log(`- ${username}`));

    console.log('\n💡 To test signup, use:');
    console.log('- A unique NIC number (not in the list above)');
    console.log('- A unique username (not in the list above)');
    console.log('- A unique email address');
    
    console.log('\n📝 Example valid signup data:');
    const timestamp = Date.now();
    console.log(JSON.stringify({
      "full_name": "New Test User",
      "user_email": `newuser${timestamp}@example.com`,
      "user_password": "123456",
      "user_name": `user${timestamp}`,
      "contact_no": "0911223344",
      "gender": "male",
      "nic": `${timestamp}`.slice(-10) // Use last 10 digits of timestamp as NIC
    }, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🔍 Checking Existing Database Data');
console.log('==================================\n');

checkExistingData();
