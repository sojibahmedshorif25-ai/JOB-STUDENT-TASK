import { connectDB } from '../config/database';
import { User } from '../models';
import bcrypt from 'bcryptjs';

async function main() {
  await connectDB();
  console.log('Connected to DB');

  const targetEmail = 'sojibahmedshorif25@gmail.com';
  const targetPassword = 'Sojibboss@321946##';
  const hashedPassword = bcrypt.hashSync(targetPassword, 10);

  const allAdmins = await User.find({ role: 'ADMIN' });
  console.log('Existing Admins:', allAdmins.map((u) => ({ id: u._id, email: u.email })));

  let target = await User.findOne({ email: targetEmail });
  if (target) {
    target.password = hashedPassword;
    target.role = 'ADMIN';
    target.isActive = true;
    target.isVerified = true;
    target.name = 'Sojib Ahmed Shorif';
    await target.save();
    console.log('Updated admin user:', targetEmail);
  } else {
    target = await User.create({
      name: 'Sojib Ahmed Shorif',
      email: targetEmail,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
      headline: 'Platform Administrator & Founder',
    });
    console.log('Created admin user:', targetEmail);
  }

  // Demote any other admin
  await User.updateMany(
    { role: 'ADMIN', email: { $ne: targetEmail } },
    { $set: { role: 'STUDENT' } }
  );

  const check = await User.findOne({ email: targetEmail }).select('+password');
  console.log('Verification check:');
  console.log('Email:', check?.email);
  console.log('Role:', check?.role);
  console.log('Password valid?:', bcrypt.compareSync(targetPassword, check?.password || ''));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
