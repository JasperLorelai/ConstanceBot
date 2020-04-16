module.exports = {
    name: "dmcmds",
    description: "Lists of all commands that can be executed in DMs.",
    aliases: ["dmcommands"],
    async execute(message) {
        const {client, channel, author, guild} = message;
        const {commands, util} = client;
        const text = commands
            .filter(c => !c.guildOnly && c.hide && !(c.guildWhitelist && !c.guildWhitelist.includes(guild.id)))
            .map(c => "\* `" + c.name + (c.params ? " " + c.params.join(" ") : "") + "` " + (c.perm && c.perm === "author" ? " (**Bot Author**)" : ""))
            .join("\n");
        await channel.send(author.toString(), util.embed("DM Command List", text));
    }
};
