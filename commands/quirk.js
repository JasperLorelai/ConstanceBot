// noinspection JSUnusedLocalSymbols
module.exports = {
    name: "quirk",
    description: "Sends the official list of quirks with hyperlinks that lead to their cards.",
    aliases: ["quirks"],
    params: ["(quirk)"],
    guildWhitelist: [require("../files/config").guilds.mhap],
    async execute(message, args) {
        const {client, channel, author} = message;
        const {config, util} = client;
        if (args.length) {
            const lists = await util.getTrello("boards/" + config.trello.boards.mhap + "/lists");
            const quirkList = lists.find(l => l.name === "Quirks");
            if (!quirkList) {
                channel.send(author.toString(), util.embed("Quirks", "Exception encountered. This was automatically reported and will be resolved.", config.color.red));
                config.botLog().send(config.author.toString(), util.embed("Quirk Command Exception", "User **" + author.username + "** couldn't request quirk information becasue the \"Quirks\" list couldn't be found. [\(Jump\)](" + message.url + ")", config.color.red));
                return;
            }
            let quirks = [];

            for (let q of await util.getTrello("lists/" + quirkList.id + "/cards")) {
                quirks.push({id: q.id, desc: q["desc"], name: q["desc"].match(/##\s?Quirk:\s[^\n]*/g)[0].substr(10)});
            }
            const quirk = quirks.find(q => q.name.toLowerCase().includes(args.join(" ").toLowerCase()));
            if (!quirk) {
                channel.send(author.toString(), util.embed("Quirk " + args.join(" ").toFormalCase(), "Quirk not found. Please look through the list using the `quirks` command.", config.color.red));
                return;
            }
            channel.send(author.toString(), util.embed("Quirk - " + quirk.name, quirk.desc.discordMKD()).setURL("https://trello.com/c/" + quirk.id));
            return;
        }

        channel.send(author.toString(), util.embed("Quirks", (await util.getTrello("cards/" + config.trello.cards.quirksRoster)).desc.discordMKD()).setURL("https://trello.com/c/" + config.trello.cards.quirksRoster));
    }
};
