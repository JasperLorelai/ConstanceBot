// noinspection JSUnusedLocalSymbols
module.exports = {
    name: "banlist",
    description: "List banned users and the reason for their ban.",
    aliases: ["bans"],
    guildOnly: true,
    perm: "mod",
    async execute(message) {
        const {client, channel} = message;
        const {config} = client;
        const text = (await message.guild.fetchBans()).map(b => "**" + b.user.username + "** `" + b.user.id + "`: " + b.reason).join("\n\n");
        const msg = await channel.send(config.embed(client, "Guild Roles", (text.length >= 2048 ? "" : text)));
        if(text.length >= 2048) await config.handlePrompt(msg, text);
    }
};