const { User } = require('./models');

async function updateEmail() {
  const oldEmail = 'User2@gmail.com';
  const newEmail = 'User2@test.com';

  const user = await User.findOne({ where: { email: oldEmail } });
  if (!user) {
    console.log(`User dengan email "${oldEmail}" tidak ditemukan.`);
    process.exit(0);
  }

  await User.update({ email: newEmail }, { where: { email: oldEmail } });
  console.log(`Email berhasil diubah dari "${oldEmail}" ke "${newEmail}"`);
  process.exit(0);
}

updateEmail().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
