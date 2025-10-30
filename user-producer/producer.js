require('dotenv').config();
const amqp = require('amqplib');

const RABBIT_URL = process.env.RabbitMqKey;
const EXCHANGE = 'users_topic_exchange';

// 🧩 Helper to connect & publish
async function publish(routingKey, message) {
  const connection = await amqp.connect(RABBIT_URL);
  const channel = await connection.createChannel();

  // Use topic exchange (not direct)
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

  channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(message)), { persistent: true });
  console.log(`📤 Sent to [${routingKey}]:`, message);

  await channel.close();
  await connection.close();
}

// --- Individual actions ---

async function sendUser(user) {
  await publish('user.add', user);
}

async function getAllUsers() {
  await publish('user.read', {});
}

async function deleteUserById(UserId) {
  await publish('user.delete', { UserId });
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
  } 
  else if (command === 'delete') {
    const { id } = parseArgs(args);
    if (!id) {
      console.error("❌ Please provide user id, e.g. node producer.js delete id=1");
      process.exit(1);
    }
    await deleteUserById(id);
  } 
  else if (command === 'read') {
    await getAllUsers();
  } 
  else {
    console.log(`
Usage:
  node producer.js add id=1 name=Alice age=25
  node producer.js delete id=1
  node producer.js read
    `);
  }
})();
