require('dotenv').config();
const amqp = require('amqplib');

const RABBIT_URL = process.env.RabbitMqKey;
const EXCHANGE = 'users_exchange';

async function sendUser(user) {
  const connection = await amqp.connect(RABBIT_URL);
  const channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE, 'direct', { durable: true });

  const msg = JSON.stringify(user);
  channel.publish(EXCHANGE, 'add_user', Buffer.from(msg), { persistent: true });

  console.log("📤 Sent user:", msg);

  await channel.close();
  await connection.close();
}

async function deleteUserById(userId) {
  const connection = await amqp.connect(RABBIT_URL);
  const channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE, 'direct', { durable: true });

  const message = JSON.stringify({ userId });
  channel.publish(EXCHANGE, 'delete_user', Buffer.from(message), { persistent: true });

  console.log(`🗑️ Sent request to delete user with id: ${userId}`);

  await channel.close();
  await connection.close();
}

// ----------- CLI Logic -----------
const [,, command, ...args] = process.argv;

function parseArgs(args) {
  const obj = {};
  args.forEach(arg => {
    const [key, value] = arg.split('=');
    obj[key] = isNaN(value) ? value : Number(value);
  });
  return obj;
}

(async () => {
  if (command === 'add') {
    const user = parseArgs(args);
    if (!user.id || !user.name) {
      console.error("❌ Please provide id and name, e.g. node producer.js add id=1 name=Alice age=25");
      process.exit(1);
    }
    await sendUser(user);
  } else if (command === 'delete') {
    const { id } = parseArgs(args);
    if (!id) {
      console.error("❌ Please provide user id, e.g. node producer.js delete id=1");
      process.exit(1);
    }
    await deleteUserById(id);
  } else {
    console.log(`
Usage:
  node producer.js add id=1 name=Alice age=25
  node producer.js delete id=1
    `);
  }
})();
