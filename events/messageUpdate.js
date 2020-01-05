const client = require("../bot");
client.on("messageUpdate", async (oldMessage, newMessage) => {
    const {config, keyv} = client;
    let realprefix = null;
    let db = await keyv.get("guilds");
    if(oldMessage.guild && db[oldMessage.guild.id] && db[oldMessage.guild.id].prefix) realprefix = db[oldMessage.guild.id].prefix;
    if(!oldMessage.content.startsWith(config.globalPrefix)) {
        if(!oldMessage.guild) return;
        if(!(realprefix || oldMessage.content.startsWith(realprefix))) return;
    }
    if(!newMessage.content.startsWith(config.globalPrefix)) {
        if(!newMessage.guild) return;
        if(!(realprefix || newMessage.content.startsWith(realprefix))) return;
    }
    client.emit("message", newMessage);
});