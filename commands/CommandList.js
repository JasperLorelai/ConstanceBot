module.exports = {
    name: "cmds",
    description: "Lists of all bot commands.",
    aliases: ["commands"],
    async execute(Libs, message) {
        const {Util} = Libs;
        const {guild, channel, author} = message;
        const Client = message.client;

        try {
            let perm;
            // noinspection JSValidateTypes
            const text = Client.commands.filter(c => !c.hide && !(c.guildWhitelist && !c.guildWhitelist.includes(guild.id))).map(c => {
                perm = c.perm;
                if (perm === "author") perm = "**Bot Author**";
                if (perm === "admin") perm = "**Server Administrator**";
                if (perm === "mod") perm = "**Server Moderator**";
                return "\* `" + c.name + (c.params ? " " + c.params.join(" ") : "") + "` " + (perm ? " (" + perm + ")" : "")
            }).join("\n") + (!guild ? "\n\nUse the `dmcmds` command to only list commands that can be executed in DMs." : "");
            await channel.send(author.toString(), Util.embed("Command List", text));
        }
        catch (e) {
            await Util.handleError(message, e);
        }
    }
};
