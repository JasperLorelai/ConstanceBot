// noinspection JSUnusedLocalSymbols
module.exports = {
    name: "quirks",
    description: "Sends the official list of quirks with hyperlinks that lead to their cards.",// If a quirk is specified, it will display information about that specific quirk.",
    //aliases: ["quirk"],
    //params: ["(quirk)"],
    async execute(message, args) {
        // TODO: Add quirk specific search.
        const {client, channel} = message;
        const {config} = client;
        const {roster} = config.trello.quirks;
        const json = await client.fetch("https://api.trello.com/1/cards/" + roster).then(y => y.text());
        channel.send(config.embed(client,"Quirk List",JSON.parse(json).desc).setURL("https://trello.com/c/" + roster));
    }
};