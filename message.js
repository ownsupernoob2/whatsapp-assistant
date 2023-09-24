const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();

async function handleAIMessage(msg, chatHistories, chatKey, contact, maxChatHistorySize, userKeys) {
  const configuration = new Configuration({
    apiKey: userKeys[chatKey] ? userKeys[chatKey] : process.env.OPENAI_API_KEY,
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

  // Function to make an OpenAI API request with retries
  async function makeOpenAIRequest() {
    try {
      // Generate response using the chat's history
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant in WhatsApp, you are created by Mina Ali but the AI itself is by OPENAI. Mina Ali a 14-year-old boy who is interested in programming. You are called WhatsChat and you use WhatsApp's way of making things *bold*, _italic_, and ``` code ```. The user you are talking to is called " +
              contact.pushname +
              ". Remember it when you mention them or if they ask you. IT IS THEIR NAME!. There might be multiple users, you should keep track of which are talking and to not mix different conversations. Don't put 'WhatsChat' in the beggining of your messages",
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
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.error &&
        error.response.data.error.code === 'rate_limit_exceeded'
      ) {
        // Rate limit exceeded error, send a message to the user and retry after a delay (e.g., 20 seconds)
        console.error('Rate limit exceeded. Retrying after a delay...');
        await msg.reply("Sorry, Im currently experiencing high demand. I'll get back to you in 20 seconds or if you are using trial you can set up your own OPENAI key with @key [YOUR_OPENAI_KEY]");
        setTimeout(makeOpenAIRequest, 20000); // Retry after 20 seconds
      } else {
        // Handle other errors
        console.error('Error:', error);
      }
    }
  }

  // Make the initial OpenAI API request

  if (chatHistories[chatKey].length > 8 && userKeys[chatKey] === null) {
      msg.reply("You have ran out of free trial. Please use your own OpenAI key with @[YOUR_OPENAI_KEY_HERE] and make sure it is in brackets or parentheses. See https://platform.openai.com/docs/api-reference for help in obtaining an API Key.")
  } else {
    makeOpenAIRequest();
  }
  console.log(chatHistories)
  console.log(chatHistories[chatKey].length)
}

module.exports = { handleAIMessage };
