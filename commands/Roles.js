const {Util} = require("../Libs");

module.exports = {
    name: "roles",
    description: "Lists of all guild roles.",
    guildOnly: true,
    async execute(message) {
        const {guild, channel, author} = message;

        let roles = guild.roles.cache.array();
        // Skip @everyone
        roles.shift();
        const text = roles.map(r => r.toString() + " - `<@&" + r + ">` **(" + r.members.size + ")**").join("\n");
        const msg = await channel.send(author.toString(), Util.embed("Guild Roles", (text.length >= 2000 ? "" : text)));
        if (text.length >= 2000) await Util.handlePrompt(msg, text);
    }
};
