module.exports = {
    name: "quirk",
    description: "Sends the official list of quirks with hyperlinks that lead to their cards.",
    aliases: ["quirks"],
    params: ["(quirk)"],
    guildWhitelist: ["mhap"],
    async execute(Libs, message, args) {
        const {Config, Util, ConditionException} = Libs;
        const {channel, author} = message;

        if (args.length) {
            const lists = await Util.getTrello("boards/" + Config.trello.boards.mhap + "/lists");
            const quirkList = lists.find(l => l.name === "Quirks");
            if (!quirkList) {
                Config.botLog().send(Config.author.toString(), Util.embed("Quirk Command Exception", "User **" + author.username + "** couldn't request quirk information becasue the \"Quirks\" list couldn't be found. [\(Jump\)](" + message.url + ")", Config.color.red));
                throw new ConditionException(author, "Quirks", "Exception encountered. This was automatically reported and will be resolved.");
            }
            let quirks = [];

            for (let q of await Util.getTrello("lists/" + quirkList.id + "/cards")) {
                quirks.push({id: q.id, desc: q["desc"], name: q["desc"].match(/##\s?Quirk:\s[^\n]*/g)[0].substr(10)});
            }
            const quirk = quirks.find(q => q.name.toLowerCase().includes(args.join(" ").toLowerCase()));
            if (!quirk) throw new ConditionException(author, "Quirk " + args.join(" ").toFormalCase(), "Quirk not found. Please look through the list using the `quirks` command.");

            channel.send(author.toString(), Util.embed("Quirk - " + quirk.name, quirk.desc.discordMKD()).setURL("https://trello.com/c/" + quirk.id));
            return;
        }

        channel.send(author.toString(), Util.embed("Quirks", (await Util.getTrello("cards/" + Config.trello.cards.quirksRoster)).desc.discordMKD()).setURL("https://trello.com/c/" + Config.trello.cards.quirksRoster));
    }
};
