const TelegramBot = require('node-telegram-bot-api');
const token = require('./config').token
const chatId = require('./config').chatId
const bot = new TelegramBot(token, {polling: false});

module.exports = (msg)=>bot.sendMessage(chatId,msg)