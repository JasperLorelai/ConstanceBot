module.exports = {
    name: "quirk",
    description: "Sends the official list of quirks with hyperlinks that lead to their cards.",
    aliases: ["quirks"],
    params: ["(quirk)"],
    guildWhitelist: ["mhap"],
    async execute(Libs, message, args) {
        const {Config, Util, ConditionException} = Libs;

        if (!args.length) {
            message.reply(Util.embed("Quirks", (await Util.getTrello("cards/" + Config.trello.cards.quirksRoster)).desc.discordMKD()).setURL("https://trello.com/c/" + Config.trello.cards.quirksRoster));
            return;
        }

        const initialMsg = await message.reply(Util.embed("Quirks", "Pending information...", Config.color.yellow));

        const lists = await Util.getTrello("boards/" + Config.trello.boards.mhap + "/lists");
        const quirkList = lists.find(l => l.name === "Quirks");
        if (!quirkList) {
            Config.botLog().send(Config.author.toString(), Util.embed("Quirk Command Exception", "User **" + message.author.username + "** couldn't request quirk information because the \"Quirks\" list couldn't be found. [\(Jump\)](" + message.url + ")", Config.color.red));
            initialMsg.delete();
            throw new ConditionException(message, "Quirks", "Exception encountered. This was automatically reported and will be resolved.");
        }

        const quirks = await Util.getTrello("lists/" + quirkList.id + "/cards");
        const quirkName = args.join(" ").toLowerCase();
        const quirk = quirks.find(q => q.name.toLowerCase().includes(quirkName));
        initialMsg.delete();
        if (!quirk) throw new ConditionException(message, "Quirk " + quirkName.toFormalCase(), "Quirk not found. Please look through the list using the `quirks` command.");

        const text = quirk.desc.discordMKD();
        const msg = await message.reply(Util.embed("Quirk - " + quirk.name, (text.length >= 2000 ? "" : text)).setURL("https://trello.com/c/" + quirk.id));
        if (text.length >= 2000) await Util.handlePrompt(msg, text);
    }
};
