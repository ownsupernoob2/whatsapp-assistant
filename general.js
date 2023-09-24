const { Configuration, OpenAIApi } = require("openai");

module.exports = {
  handleCommands: async (msg, client, chatHistories, chatKey, userKeys) => {
    const chat = await msg.getChat();
    let text = "";
    let mentions = [];

    if (msg.body.charAt(1) === "[") {
      try {
        var regexp = /[\[|\(](.*)[\]\)]/;
        var match = msg.body.match(regexp);
        console.log(match[1]);
      } catch (e) {
        msg.reply(
          "Something went wrong, perhaps you forgot to close the brackets/parenthesis?"
        );
      }

      let apiKeyValid = true;

      try {
        apiKeyValid = true;
        const configuration = new Configuration({
          apiKey: match[1],
        });
        const openai = new OpenAIApi(configuration);

        await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "test",
            },
            {
              role: "user",
              content: "test",
            },
          ],
          // Other parameters
        });
      } catch (e) {
        apiKeyValid = false;

        msg.reply(
          `The following API key is invalid, expired or is new, please try again later.`
        );
      } finally {
        if (apiKeyValid === true) {
          userKeys[chatKey] = match[1];
          msg.reply(`The following API key seems to be valid, enjoy!`);
        }
      }
    } else if (msg.body == "@help") {
      setTimeout(0.2);
      const introText =
        "Welcome to WhatsChat, your WhatsApp AI assistant! 🤖\n\nHere's how you can get started:\n- Use '!' to chat with the AI.\n- Set your OpenAI API key using '@[YOUR_API_KEY]' to access advanced features like speech to text (You're API key will only be used between you and the AI, no one else. The only time someone can use your API key is when you provide it in a group chat.).\n- More commands will be avaliable next time. \n\nFeel free to explore and enjoy the features of WhatsChat! If you have any questions or need help, don't hesitate to ask. 😊";

        setTimeout(() => {
          msg.reply(introText);
   }, 200); 
    } else {
      msg.reply(
        "I don't recognize that command. The only system commands you can do is @help or @[YOUR_API_KEY] for now (more coming soon)."
      );
    }
  },
};
