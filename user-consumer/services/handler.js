const { addUser, deleteUserById, readUsers } = require('../services/userService');

const EXCHANGE_MAIN = 'users_topic_exchange';
const EXCHANGE_CONFIRM = 'exchange';

const handlers = {
  // --- Add user ---
  'user.add': async (data, channel) => {
    addUser(data);
    console.log(`✅ Added user: ${data.name}`);

    await channel.assertExchange(EXCHANGE_CONFIRM, 'topic', { durable: true });
    await channel.publish(
      EXCHANGE_CONFIRM,
      'user.add.response',
      Buffer.from(JSON.stringify({ message: `${data.name} added successfully` })),
      { persistent: true }
    );
  },

  // --- Delete user ---
  'user.delete': async (data, channel) => {
    if (!data.UserId) return;
    deleteUserById(data.UserId);
    console.log(`🗑️ Deleted user ID: ${data.UserId}`);

    await channel.assertExchange(EXCHANGE_CONFIRM, 'topic', { durable: true });
    await channel.publish(
      EXCHANGE_CONFIRM,
      'user.delete.response',
      Buffer.from(JSON.stringify({ message: `User ${data.UserId} deleted successfully` })),
      { persistent: true }
    );
  },

  // --- Read all users ---
  'user.read': async (data, channel) => {
    const users = readUsers();
    console.log('📋 Sending all users as response...');

    await channel.assertExchange(EXCHANGE_CONFIRM, 'topic', { durable: true });
    await channel.publish(
      EXCHANGE_CONFIRM,
      'user.read.response',
      Buffer.from(JSON.stringify({ users })),
      { persistent: true }
    );

    return users;
  }
};

module.exports = handlers;
