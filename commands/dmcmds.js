module.exports = {
    name: "dmcmds",
    description: "Lists of all commands that can be executed in DMs.",
    aliases: ["dmcommands"],
    async execute(message) {
        const {client, channel, author} = message;
        const {commands, config} = client;
        const text = commands.filter(c => !c.guildOnly).map(c => "- `" + c.name +
            (c.params ? " " + c.params.join(" ") : "") + "` " +
            (c.perm && c.perm === "author" ? " - Required permissions: **Bot Author**" : "")
        ).join("\n");
        await channel.send(author.toString(), config.embed( "DM Command List", text));
    },
};