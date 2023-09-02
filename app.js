const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const { handleVoiceMessage } = require("./components/voice");
const { handleAIMessage } = require("./components/message");
const { handleCommands } = require("./components/general");

require('dotenv').config();

const client = new Client({
  authStrategy: new LocalAuth(),
});

const maxChatHistorySize = 100; // Maximum number of messages to keep in chat history

let chatHistories = {}; // Initialize an empty dictionary to store chat histories

client.initialize();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("Autenticating...");
});

client.on("ready", () => {
  console.log("Bot is ready!");
});

client.on("message", async (msg) => {
  const chat = await msg.getChat(); // Gets chat information
  const contact = await msg.getContact(); // gets the contact information
  const info = await msg.getInfo(); // useless for now
  const userId = contact.id._serialized; // Unique identifier for the user
  const chatId = chat.id._serialized; // Unique identifier for the chat

  // Determine if it's a group chat or not
  const isGroupChat = contact.isGroup;

  // Use the chatId for group chats, and userId for individual chats
  const chatKey = isGroupChat ? chatId : userId;

  if (!chatHistories[chatKey]) {
    // Initialize a new chat history for this chat if it doesn't exist
    chatHistories[chatKey] = [];
  }

  if (msg.type == 'ptt') {
    // Handle voice message that begins with "Hey GPT" or "Hello GPT"
    handleVoiceMessage(msg, chatHistories, chatKey, contact, maxChatHistorySize);
    }

  if (msg.body === "@everyone" && isGroupChat) {
    // Handles general commands that starts with '@'
    handleCommands(msg, client);
  }

  if (msg.body.charAt(0) === "!") {
    // Handle AI message that begins with "!"
    handleAIMessage(msg, chatHistories, chatKey, contact, maxChatHistorySize);
  }
});