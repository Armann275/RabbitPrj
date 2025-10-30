
const confirmHandlers = {
  'user.add.response': (msg) => console.log('✅ [ADD CONFIRMATION]:', msg),
  'user.read.response': (msg) => console.log('📋 [USER LIST]:', msg.users),
  'user.delete.response': (msg) => console.log('🗑️ [DELETE CONFIRMATION]:', msg)
};


module.exports = confirmHandlers