// noinspection JSUnusedLocalSymbols
module.exports = {
    name: "taken",
    description: "Sends the official list of canon characters on our server.",
    aliases: ["characters"],
    guildWhitelist: [require("../files/Config").guildData.mhap.id],
    async execute(message) {
        const Client = message.client;
        const {channel, author} = message;
        const {Config, Util} = Client;
        const chars = (await Util.getTrello("cards/" + Config.trello.cards.characters)).desc.discordMKD();
        const msg = await channel.send(author.toString(), Util.embed("Canon Character List", (chars.length >= 2000 ? "" : chars)));
        if (chars.length >= 2000) await Util.handlePrompt(msg, chars);
    }
};
