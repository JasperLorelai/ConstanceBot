module.exports = {
    name: "roles",
    description: "Lists of all guild roles.",
    guildOnly: true,
    async execute(message) {
        const {guild, channel, client} = message;
        const {util} = client;
        let roles = guild.roles.cache.array();
        // Skip @everyone
        roles.shift();
        const text = roles.map(r => r.toString() + " - `<@&" + r + ">` **(" + r.members.size + ")**").join("\n");
        const msg = await channel.send(util.embed("Guild Roles", (text.length >= 2000 ? "" : text)));
        if(text.length >= 2000) await util.handlePrompt(msg, text);
    }
};