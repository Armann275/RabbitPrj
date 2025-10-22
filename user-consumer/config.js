require('dotenv').config();

module.exports = {
  RABBIT_URL: process.env.RabbitMqKey,
  EXCHANGE: 'users_exchange',
  USERS_FILE: './users.json',
};
