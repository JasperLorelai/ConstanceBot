module.exports = {
    name: "banlist",
    description: "List banned users and the reason for their ban.",
    aliases: ["bans"],
    guildOnly: true,
    perm: "mod",
    async execute(Libs, message) {
        const {Util} = Libs;
        const {channel, author} = message;

        const text = (await message.guild.fetchBans()).map(b => "**" + b.user.username + "** `" + b.user.id + "`: " + (b.reason === "null" ?  "No reason given." : b.reason)).join("\n\n");
        const msg = await channel.send(author.toString(), Util.embed("Guild Bans", (text.length >= 2000 ? "" : text)));
        if (text.length >= 2000) await Util.handlePrompt(msg, text);
    }
};
