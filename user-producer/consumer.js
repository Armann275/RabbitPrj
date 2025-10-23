const amqp = require('amqplib');
require('dotenv').config();

const RABBIT_URL = process.env.RabbitMqKey;
const EXCHANGE = 'users_exchange';

const queues = {
  added: 'user_added_queue',
  deleted: 'user_deleted_queue',
};

async function consumeConfirmation() {
  const connection = await amqp.connect(RABBIT_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, 'direct', { durable: true });

  // --- User added confirmation ---
  await channel.assertQueue(queues.added, { durable: true });
  await channel.bindQueue(queues.added, EXCHANGE, 'user_added');

  // --- User deleted confirmation ---
  await channel.assertQueue(queues.deleted, { durable: true });
  await channel.bindQueue(queues.deleted, EXCHANGE, 'user_deleted');

  console.log('👂 Waiting for confirmation messages (add/delete)...');

  // Consume user added confirmations
  channel.consume(queues.added, (msg) => {
    if (!msg) return;
    console.log('✅ [ADD CONFIRMATION]:', msg.content.toString());
    channel.ack(msg);
  });

  // Consume user deleted confirmations
  channel.consume(queues.deleted, (msg) => {
    if (!msg) return;
    console.log('🗑️ [DELETE CONFIRMATION]:', msg.content.toString());
    channel.ack(msg);
  });
}

consumeConfirmation();
