const bcrypt = require('bcryptjs');

const plainPassword = 'password123';

(async () => {
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  console.log('Hashed Password:', hashedPassword);

  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  console.log('Manual password comparison result:', isMatch);
})();
