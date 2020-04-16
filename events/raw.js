const client = require("../bot");
client.on("raw", async event => {
    let channel, user, message;
    switch (event.t) {
        case "MESSAGE_REACTION_ADD":
        case "MESSAGE_REACTION_REMOVE":
            channel = client.channels.resolve(event.d["channel_id"]);
            // Ignore if cached already to avoid duplicate events.
            if (channel.messages.cache.has(event.d["message_id"])) return;
            message = await channel.messages.fetch(event.d["message_id"]);
            const reaction = message.reactions.resolve(event.d.emoji.id ? event.d.emoji.name + ":" + event.d.emoji.id : event.d.emoji.name);
            user = client.users.resolve(event.d["user_id"]);
            if (reaction) reaction.users.cache.set(user.id, user);
            client.emit(event.t === "MESSAGE_REACTION_ADD" ? "messageReactionAdd" : "messageReactionRemove", reaction, user);
            break;
        case "MESSAGE_UPDATE":
            channel = client.channels.resolve(event.d["channel_id"]);
            // Ignore if cached already to avoid duplicate events.
            if (channel.messages.cache.has(event.d.id)) return;
            message = await channel.messages.fetch(event.d.id);
            client.emit("messageUpdate", null, message);
            break;
    }
});
