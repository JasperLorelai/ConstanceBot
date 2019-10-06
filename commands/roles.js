module.exports = {
    name: "roles",
    description: "Lists of all guild roles.",
    guildOnly: true,
    async execute(message) {
        const fun = require("../files/config");
        let roles = message.guild.roles.array();
        roles.shift();
        const text = roles.map(r => r.toString() + " - `<@&" + r + ">` **(" + r.members.size + ")**").join("\n");
        const msg = await message.channel.send(fun.embed(message.client, "Guild Roles", (text.length >= 2048 ? "" : text)));
        if(text.length >= 2048) await fun.handlePrompt(msg, text);
    }
};