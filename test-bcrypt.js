console.log("Testing bcryptjs require");
const bcrypt = require('bcryptjs');
console.log("Hashing...");
const hash = bcrypt.hashSync("password", 10);
console.log(hash);
