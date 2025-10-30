const amqp = require('amqplib');
require('dotenv').config();

const RABBIT_URL = process.env.RabbitMqKey;
const EXCHANGE_CONFIRM = 'exchange';
const QUEUE_CONFIRM = 'user_confirmations_queue';
const ROUTING_PATTERN = 'user.#'; // Matches user.add.response, user.read.response, etc.
const  confirmHandlers = require('./services/handler');


async function consumeAllConfirmations() {
  const connection = await amqp.connect(RABBIT_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_CONFIRM, 'topic', { durable: true });
  await channel.assertQueue(QUEUE_CONFIRM, { durable: true });
  await channel.bindQueue(QUEUE_CONFIRM, EXCHANGE_CONFIRM, ROUTING_PATTERN);

  console.log(`👂 Listening for confirmations on '${QUEUE_CONFIRM}' (pattern: '${ROUTING_PATTERN}')`);

  channel.consume(QUEUE_CONFIRM, (msg) => {
    if (!msg) return;

    const routingKey = msg.fields.routingKey;
    const content = JSON.parse(msg.content.toString());

    const handler = confirmHandlers[routingKey];
    if (handler) {
      handler(content);
    } else {
      console.warn('⚠️ Unknown confirmation routing key:', routingKey);
    }

    channel.ack(msg);
  });
}

consumeAllConfirmations().catch(console.error);
