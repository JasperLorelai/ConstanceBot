module.exports = {
    name: "taken",
    description: "Sends the official list of canon characters on our server.",
    aliases: ["characters"],
    guildWhitelist: ["mhap"],
    async execute(Libs, message) {
        const {Config, Util} = Libs;
        const {channel, author} = message;

        try {
            const chars = (await Util.getTrello("cards/" + Config.trello.cards.characters)).desc.discordMKD();
            const msg = await channel.send(author.toString(), Util.embed("Canon Character List", (chars.length >= 2000 ? "" : chars)));
            if (chars.length >= 2000) await Util.handlePrompt(msg, chars);
        }
        catch (e) {
            await Util.handleError(message, e);
        }
    }
};
