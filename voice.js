const fs = require("fs");
const { Leopard } = require("@picovoice/leopard-node");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();



module.exports = {
  handleVoiceMessage: async (msg, chatHistories, chatKey, maxChatHistorySize, userKeys) => {
    const handle = new Leopard(process.env.PICOVOICE_API_KEY);

    
    const configuration = new Configuration({
      apiKey: userKeys[chatKey] ? userKeys[chatKey] : process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const userId = contact.id._serialized; // Unique identifier for the user
    const chatId = chat.id._serialized; // Unique identifier for the chat

    // Determine if it's a group chat or not

    // Use the chatId for group chats, and userId for individual chats

    if(userKeys[chatKey] === null) {
        msg.reply("To be able to use the voice feature, please put your OpenAI API key like this: @[YOUR_API_KEY]")
    } else {
    try {
      console.log("Voice Clip Received");

      var audioPath = `voice_message_${Math.floor(
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
            msg.reply("You have ran out of free trial. Please use your own OpenAI key with @[YOUR_OPENAI_KEY_HERE] and make sure it is in brackets or parentheses. See https://platform.openai.com/docs/api-reference for help obtaining a OpenAI key. Don't forget that the STT also cost money, don't abuse me.")
        } else {
          makeOpenAIRequest();
        }
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      // Delete the audio file after transcription
      await fs.promises.unlink(audioPath);
      console.log(`Audio file ${audioPath} deleted after transcription`);
    }
  } 
}
};
