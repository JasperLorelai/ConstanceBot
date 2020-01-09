// noinspection JSUnusedLocalSymbols
module.exports = {
    name: "quirk",
    description: "Sends the official list of quirks with hyperlinks that lead to their cards.",
    // TODO: If a quirk is specified, it will display information about that specific quirk.
    aliases: ["quirks"],
    params: ["(quirk)"],
    async execute(message, args) {
        const {client, channel, author} = message;
        const {config, fetch} = client;
        if(args.length) {
            const lists = await fetch("https://api.trello.com/1/boards/" + config.trello.boards.mhap + "/lists" + config.getTrello()).then(y => y.json());
            const quirkList = lists.find(l => l.name === "Quirks");
            if(!quirkList) {
                channel.send(author.toString(), config.embed("Quirks", "Exception encountered. This was automatically reported and will be resolved.", config.color.red));
                config.botLog().send(config.author.toString(), config.embed("Quirk Command Exception", "User **" + author.username +"** couldn't request quirk information becasue the \"Quirks\" list couldn't be found. [\(Jump\)](" + message.url + ")", config.color.red));
                return;
            }
            let quirks = [];
            for(let q of await fetch("https://api.trello.com/1/lists/" + quirkList.id + "/cards" + config.getTrello()).then(y => y.json())) {
                quirks.push({id: q.id, desc: q["desc"], name: q["desc"].match(/##\s?Quirk:\s[^\n]*/g)[0].substr(10)});
            }
            const quirk = quirks.find(q => q.name.toLowerCase().includes(args.join(" ").toLowerCase()));
            if(!quirk) {
                channel.send(author.toString(), config.embed("Quirk " + args.join(" ").toFormalCase(), "Quirk not found. Please look through the list using the `quirks` command.", config.color.red));
                return;
            }
            channel.send(author.toString(), config.embed("Quirk - " + quirk.name, quirk.desc.mkdHeadersToNormal().mkdRemoveRuler()).setURL("https://trello.com/c/" + quirk.id));
            return;
        }
        channel.send(author.toString(), config.embed("Quirks", (await fetch("https://api.trello.com/1/cards/" + config.trello.cards.quirksRoster + config.getTrello()).then(y => y.json())).desc.mkdHeadersToNormal().mkdRemoveRuler()).setURL("https://trello.com/c/" + config.trello.cards.quirksRoster));
    }
};