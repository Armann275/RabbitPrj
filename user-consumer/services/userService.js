const fs = require('fs');
const { USERS_FILE } = require('../config');

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function addUser(user) {
  const users = readUsers();
  users.push(user);
  saveUsers(users);
  return user;
}

function deleteUserById(userId) {
  const users = readUsers();
  const updated = users.filter(u => u.id !== userId);
  saveUsers(updated);
  return userId;
}

module.exports = { addUser, deleteUserById ,readUsers};
