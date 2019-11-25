const client = require("../bot");
client.on("messageUpdate", async (oldMessage, newMessage) => {
    const {config, keyv} = client;
    if(!oldMessage.content.startsWith(config.globalPrefix)) {
        if(!oldMessage.guild) return;
        if(!oldMessage.content.startsWith(await keyv.get("prefix." + oldMessage.guild.id))) return;
    }
    if(!newMessage.content.startsWith(config.globalPrefix)) {
        if(!newMessage.guild) return;
        if(!newMessage.content.startsWith(await keyv.get("prefix." + newMessage.guild.id))) return;
    }
    client.emit("message", newMessage);
});