const { createConnection, publishMessage } = require('./services/rabbit');
const { addUser, deleteUserById, readUsers} = require('./services/userService');
const { EXCHANGE } = require('./config.js');

async function consumeUsers() {
  const { channel } = await createConnection();

  const queues = {
    add: 'add_user_queue',
    delete: 'delete_user_queue',
    getAllUsers: 'get_users_queue'
  };

  await channel.assertQueue(queues.add, { durable: true });
  await channel.assertQueue(queues.delete, { durable: true });
  await channel.assertQueue(queues.getAllUsers, { durable: true });

  await channel.bindQueue(queues.add, EXCHANGE, 'add_user');
  await channel.bindQueue(queues.delete, EXCHANGE, 'delete_user');
  await channel.bindQueue(queues.getAllUsers, EXCHANGE, 'get_users');

  console.log("👂 Waiting for add or delete user messages...");

  // --- Add user consumer ---
  channel.consume(queues.add, (msg) => {
    if (!msg) return;

    try {
      const user = JSON.parse(msg.content.toString());
      addUser(user);
      console.log(`✅ Added user: ${user.name}`);

      publishMessage(channel, 'user_added', { message: `${user.name} added successfully` });
    } catch (err) {
      console.error('❌ Error adding user:', err);
    }

    channel.ack(msg);
  });

  channel.consume(queues.getAllUsers,(msg) => {
      if (!msg) return;
      try {
        const arr = readUsers();
        console.log(arr);
        publishMessage(channel, 'user_read', { users: arr });
      } catch (err) {
         console.error('❌ Error reading users:', err);
      }
      
      channel.ack(msg);
  })

  // --- Delete user consumer ---
  channel.consume(queues.delete, (msg) => {
    if (!msg) return;
    const { UserId } = JSON.parse(msg.content.toString());
    if (!UserId) {
        return
    }
    try {
      
      deleteUserById(UserId);
      console.log(`🗑️ Deleted user ID: ${UserId}`);

      publishMessage(channel, 'user_deleted', { message: `User ${UserId} deleted successfully` });
    } catch (err) {
      console.error('❌ Error deleting user:', err);
    }

    channel.ack(msg);
  });

  
}

consumeUsers();