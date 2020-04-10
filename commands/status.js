module.exports = {
    name: "status",
    description: "Displays bot status.",
    aliases: [],
    async execute(message) {
        const {client, channel, author} = message;
        const {util, config} = client;
        const msg = await channel.send(author.toString(), util.embed("Bot Status", "Pinging...", config.color.yellow));
        await msg.edit(util.getEmbeds(msg)[0]
            .setColor(config.color.base)
            .setDescription(
                "**Server Ping**: `" + (msg.createdAt - message.createdAt) + " ms`" +
                "\n**API Ping**: `" + Math.round(client.ws.ping) + " ms`" +
                "\n**Uptime**: `" + util.msToTime(client.uptime) + "`")
        );
    }
};
