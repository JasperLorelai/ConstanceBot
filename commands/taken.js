// noinspection JSUnusedLocalSymbols
module.exports = {
    name: "taken",
    description: "Sends the official list of canon characters on our server.",
    aliases: ["characters"],
    async execute(message) {
        const {client, channel, author} = message;
        const {config} = client;
        const chars = JSON.parse(await client.fetch("https://api.trello.com/1/cards/" + config.trello.characters).then(y => y.text()))["desc"].mkdHeadersToNormal().mkdRemoveRuler();
        const msg = await channel.send(author.toString(), config.embed("Canon Character List", (chars.length >= 2048 ? "" : chars)));
        if(chars.length >= 2048) await config.handlePrompt(msg, text);
    }
};