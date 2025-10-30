require('dotenv').config();
const amqp = require('amqplib');
const EXCHANGE = 'users_topic_exchange';
const RABBIT_URL = process.env.RabbitMqKey;

async function publish(routingKey, message) {

  const connection = await amqp.connect(RABBIT_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

  channel.publish(
    EXCHANGE,
    routingKey,
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );

  console.log(`📤 Sent to [${routingKey}]:`, message);

  await channel.close();
  await connection.close();
}

// Individual actions

const UserActionsHandler = {
    'add': async (user) => {
        await publish('user.add', user);
    },
     'delete': async (UserId) => {
        await publish('user.delete', { UserId });
    },
     'read': async (user) => {
        await publish('user.read', {});
    }
}  