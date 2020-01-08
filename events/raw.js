const client = require("../bot");
client.on("raw", async event => {
    if(!["MESSAGE_REACTION_ADD", "MESSAGE_REACTION_REMOVE"].includes(event.t)) return;
    let channel = client.channels.resolve(event.d["channel_id"]);
    const user = client.users.resolve(event.d["user_id"]);
    const message = await channel.messages.fetch(event.d["message_id"]);
    if(channel.messages.has(event.d["message_id"])) return;
    const reaction = message.reactions.resolve(event.d.emoji.id ? event.d.emoji.name + ":" + event.d.emoji.id : event.d.emoji.name);
    if(reaction) reaction.users.set(user.id, user);
    client.emit(event.t === "MESSAGE_REACTION_ADD" ? "messageReactionAdd" : "messageReactionRemove", reaction, user);
});