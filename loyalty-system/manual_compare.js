const bcrypt = require('bcryptjs');

const plainPassword = 'Evixie123!'; // Replace with the password you used during registration
const hashedPassword = '$2a$10$MLnHSuh1ZyeC50BuwmNw0.GmHF44jCuK3.mP55FblaRrgSmM37Ceq'; // Replace with the hashed password from MongoDB

(async () => {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Manual password comparison result:', isMatch);
})();
