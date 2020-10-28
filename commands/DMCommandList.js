const {Util} = require("../Libs");

module.exports = {
    name: "dmcmds",
    description: "Lists of all commands that can be executed in DMs.",
    aliases: ["dmcommands"],
    async execute(message) {
        const {channel, author} = message;
        const Client = message.client;

        // noinspection JSValidateTypes
        let text = Client.commands.filter(c => !c.guildOnly && !c.hide);
        if (message.guild) text = text.filter(c => !(c.guildWhitelist && !c.guildWhitelist.includes(message.guild.id)));
        text = text.map(c => "\* `" + c.name + (c.params ? " " + c.params.join(" ") : "") + "` " + (c.perm && c.perm === "author" ? " (**Bot Author**)" : "")).join("\n");
        await channel.send(author.toString(), Util.embed("DM Command List", text));
    }
};
