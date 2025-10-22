const amqp = require('amqplib');
require('dotenv').config();
const RABBIT_URL = process.env.RabbitMqKey;
const EXCHANGE = 'users_exchange';
const QUEUE = 'user_added_queue';

async function consumeConfirmation() {
  const connection = await amqp.connect(RABBIT_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, 'direct', { durable: true });
  await channel.assertQueue(QUEUE, { durable: true });
  await channel.bindQueue(QUEUE, EXCHANGE, 'user_added');

  console.log("👂 Waiting for confirmation messages...");

  channel.consume(QUEUE, (msg) => {
    if (msg) {
      console.log("✅ Received:", msg.content.toString());
      channel.ack(msg);
    }
  });
}

consumeConfirmation();
