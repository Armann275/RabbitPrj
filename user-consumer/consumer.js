const amqp = require('amqplib');
require('dotenv').config();

const RABBIT_URL = process.env.RabbitMqKey;
const EXCHANGE = 'users_topic_exchange';
const QUEUE = 'user_actions_queue';
const ROUTING_PATTERN = 'user.*'; // Matches user.add, user.read, user.delete

const handlers = require('./services/handler');

async function consumeUsers() {
  const connection = await amqp.connect(RABBIT_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  await channel.assertQueue(QUEUE, { durable: true });
  await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_PATTERN);

  console.log(`👂 Listening on '${QUEUE}' for pattern '${ROUTING_PATTERN}'`);

  channel.consume(QUEUE, async (msg) => {
    if (!msg) return;

    const routingKey = msg.fields.routingKey;
    const data = JSON.parse(msg.content.toString());

    console.log(`📩 Received [${routingKey}]:`, data);

    const handler = handlers[routingKey];
    if (handler) {
      try {
        await handler(data, channel);
      } catch (err) {
        console.error(`❌ Error handling ${routingKey}:`, err);
      }
    } 

    channel.ack(msg);
  });
}

consumeUsers().catch(console.error);
