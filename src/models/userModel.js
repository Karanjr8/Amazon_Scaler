const db = require("../config/db");

const createUser = async ({ name, email, password }) => {
  const query = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING id, name, email
  `;

  const { rows } = await db.query(query, [name, email, password]);
  return rows[0];
};

const getUserByEmail = async (email) => {
  const query = `
    SELECT id, name, email, password
    FROM users
    WHERE email = $1
  `;

  const { rows } = await db.query(query, [email]);
  return rows[0] || null;
};

module.exports = {
  createUser,
  getUserByEmail,
};
