module.exports = {
    name: "dmcmds",
    description: "Lists of all commands that can be executed in DMs.",
    aliases: ["dmcommands"],
    async execute(Libs, message) {
        const {Util} = Libs;
        const {channel, author} = message;
        const Client = message.client;

        try {
            // noinspection JSValidateTypes
            let text = Client.commands.filter(c => !c.guildOnly && !c.hide);
            if (message.guild) text = text.filter(c => !(c.guildWhitelist && !c.guildWhitelist.includes(message.guild.id)));
            text = text.map(c => "\* `" + c.name + (c.params ? " " + c.params.join(" ") : "") + "` " + (c.perm && c.perm === "author" ? " (**Bot Author**)" : "")).join("\n");
            await channel.send(author.toString(), Util.embed("DM Command List", text));
        }
        catch (e) {
            await Util.handleError(message, e);
        }
    }
};
