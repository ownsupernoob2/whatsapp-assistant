const fs = require("fs");
const { Leopard } = require("@picovoice/leopard-node");
const { Configuration, OpenAIApi } = require("openai");

require("dotenv").config();

const handle = new Leopard(process.env.PICOVOICE_API_KEY);

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = {
  handleVoiceMessage: async (msg, chatHistories, maxChatHistorySize) => {
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const userId = contact.id._serialized; // Unique identifier for the user
    const chatId = chat.id._serialized; // Unique identifier for the chat

    // Determine if it's a group chat or not
    const isGroupChat = contact.isGroup;

    // Use the chatId for group chats, and userId for individual chats
    const chatKey = isGroupChat ? chatId : userId;

    try {
      console.log("Voice Clip Received");

      var audioPath = `audio/voice_message_${Math.floor(
        Math.random() * 1000000
      )}.ogg`;

      const media = await msg.downloadMedia();
      const binaryData = Buffer.from(media.data, "base64");

      await fs.promises.writeFile(audioPath, binaryData);

      const result = await handle.processFile(audioPath);
      console.log(`Transcription: ${result.transcript}`);
      
      await msg.reply('I think you said "' + result.transcript + '"');
     const GPT = result.transcript.split(" ")[0]
      if (GPT === "GPT") {
        console.log("Processing user's request...");
        // Store user message in the chat's history
        chatHistories[chatKey].push({
          role: "user",
          content: contact.pushname + ": " + result.transcript,
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
                ". Remember it when you mention them or if they ask you. IT IS THEIR NAME!. There might be multiple users, you should keep track of which are talking and to not mix different conversations. Ignore the 'Hey GPT' just answer what's after it.",
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
        console.log("Sending response to user...");
        await msg.reply(response.data.choices[0].message.content);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      // Delete the audio file after transcription
      await fs.promises.unlink(audioPath);
      console.log(`Audio file ${audioPath} deleted after transcription`);
    }
  },
};
