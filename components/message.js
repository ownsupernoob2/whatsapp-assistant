const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();

async function handleAIMessage(msg, chatHistories, chatKey, contact, maxChatHistorySize) {

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  // Store user message in the chat's history
  chatHistories[chatKey].push({
    role: "user",
    content: contact.pushname + ": " + msg.body,
  });

  // Check if the chat history exceeds the maximum size
  if (chatHistories[chatKey].length > maxChatHistorySize) {
    // Remove the oldest message(s) to maintain the maximum size
    chatHistories[chatKey] = chatHistories[chatKey].slice(
      chatHistories[chatKey].length - maxChatHistorySize
    );
  }



  // Generate response using the chat's history
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant in WhatsApp, the interface is created by Mina Alansi, a 14-year-old boy who is interested in programming. You are called WhatsGPT and you use WhatsApp's way of making things *bold*, _italic_, and ``` code ```. The user you are talking to is called " +
          contact.pushname +
          ". Remember it when you mention them or if they ask you. IT IS THEIR NAME!. There might be multiple users, you should keep track of which are talking and to not mix different conversations.",
      },
      ...chatHistories[chatKey], // Use the chat's specific chat history
    ],
    // Other parameters
  });

  // Store assistant's response in the chat's history
  chatHistories[chatKey].push({
    role: "assistant",
    content: response.data.choices[0].message.content,
  });

  // Check if the chat history exceeds the maximum size again after adding the assistant's response
  if (chatHistories[chatKey].length > maxChatHistorySize) {
    // Remove the oldest message(s) to maintain the maximum size
    chatHistories[chatKey] = chatHistories[chatKey].slice(
      chatHistories[chatKey].length - maxChatHistorySize
    );
  }

  // Send response to the user
  msg.reply(response.data.choices[0].message.content);
}

module.exports = { handleAIMessage };
