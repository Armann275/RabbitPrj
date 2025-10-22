const amqp = require('amqplib');
const { RABBIT_URL, EXCHANGE } = require('../config');
// const EXCHANGE = "users_exchange"

async function createConnection() {
  const connection = await amqp.connect(RABBIT_URL);
  const channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE, 'direct', { durable: true });
  return { connection, channel };
}

async function publishMessage(channel, routingKey, message) {
  channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(message)));
  console.log(`📤 Sent message to ${routingKey}:`, message);
}

module.exports = { createConnection, publishMessage };
