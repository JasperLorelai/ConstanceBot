// noinspection JSUnusedLocalSymbols
module.exports = {
    name: "taken",
    description: "Sends the official list of canon characters on our server.",
    aliases: ["characters"],
    guildWhitelist: [require("../files/config").guilds.mhapGuild],
    async execute(message) {
        const {client, channel, author} = message;
        const {config, util} = client;
        const chars = JSON.parse(await client.fetch("https://api.trello.com/1/cards/" + config.trello["lists"].characters).then(y => y.text()))["desc"].discordMKD();
        const msg = await channel.send(author.toString(), util.embed("Canon Character List", (chars.length >= 2000 ? "" : chars)));
        if (chars.length >= 2000) await util.handlePrompt(msg, chars);
    }
};
