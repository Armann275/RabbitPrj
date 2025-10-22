require('dotenv').config()
const amqp = require('amqplib');


const RABBIT_URL = process.env.RabbitMqKey;
console.log(RABBIT_URL);

const EXCHANGE = 'users_exchange';

async function sendUser(user) {
  const connection = await amqp.connect(RABBIT_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, 'direct', { durable: true });

  // Send user object as JSONRabbitMqKey="amqps://lqrtstup:9gJBrDGgSdKaQfhvfenqr-WPXpLA_rKl@chameleon.lmq.cloudamqp.com/lqrtstup"

  const msg = JSON.stringify(user);
  channel.publish(EXCHANGE, 'add_user', Buffer.from(msg), { persistent: true });

  console.log("📤 Sent user:", msg);RabbitMqKey="amqps://lqrtstup:9gJBrDGgSdKaQfhvfenqr-WPXpLA_rKl@chameleon.lmq.cloudamqp.com/lqrtstup"


  await channel.close();
  await connection.close();
}


async function deleteUserById(UserId) {
    const connection = await amqp.connect(RABBIT_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE, 'direct', { durable: true });

    const message = JSON.stringify({UserId});

    channel.publish(EXCHANGE, 'delete_user', Buffer.from(message), { persistent: true });

    console.log(`🗑️ Sent request to delete user with id: ${UserId}`);

    await channel.close();
    await connection.close();

}


deleteUserById(2);

// sendUser({ id: 2, name: "s", age: 55 });
