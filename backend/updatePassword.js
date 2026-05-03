const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function updatePassword() {
  const email = 'admin@test.com';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('123', salt);
  
  await User.update({ password: passwordHash }, { where: { email } });
  console.log('Password updated successfully');
}

updatePassword();
