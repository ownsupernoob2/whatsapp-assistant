module.exports = {
    handleCommands: async (msg, client) => {
      const chat = await msg.getChat();
      let text = "";
      let mentions = [];
  
      for (let participant of chat.participants) {
        const contact = await client.getContactById(participant.id._serialized);
        mentions.push(contact);
        text += `@${participant.id.user} `;
      }
  
      await chat.sendMessage(text, { mentions });
    },
  };