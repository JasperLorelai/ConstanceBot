module.exports = {
    name: "dmcmds",
    description: "Lists of all commands that can be executed in DMs.",
    aliases: ["dmcommands"],
    async execute(message) {
        const fun = require("../files/config");
        const text = message.client.commands.filter(c => !c.guildOnly).map(c => "- `" + c.name +
            (c.params ? " " + c.params.join(" ") : "") + "` " +
            (c.perm && c.perm === "author" ? " - Required permissions: **Bot Author**" : "")
        ).join("\n");
        await message.channel.send(message.author.toString(), fun.embed(message.client, "DM Command List", text));
    },
};