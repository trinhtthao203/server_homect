require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
<<<<<<< HEAD
<<<<<<< HEAD
  user: "postgres",
  host: "localhost",
  database: "homect_db",
  password: "616944@TtT",
  // database: 'myDB',
  // password: 'qr123456',
=======
  user: 'postgres',
  host: 'localhost',
  database: 'myDB',
  password: 'qr123456',
  //password: '616944@TtT',
>>>>>>> main
=======
  user: "postgres",
  host: "localhost",
  database: "db_homect",
  // password: 'qr123456',
  password: "616944@TtT",
>>>>>>> 1ef0fb331a37efd818e47ecc13332a1acd3bc8ba
  port: 5432,
});

module.exports = { pool };
