module.exports = {
    name: "status",
    description: "Displays bot status.",
    aliases: [],
    async execute(message) {
        const Client = message.client;
        const {channel, author} = message;
        const {Util, Config} = Client;
        const msg = await channel.send(author.toString(), Util.embed("Bot Status", "Pinging...", Config.color.yellow));
        await msg.edit(Util.getEmbeds(msg)[0]
            .setColor(Config.color.base)
            .setDescription(
                "**Server Ping**: `" + (msg.createdAt - message.createdAt) + " ms`" +
                "\n**API Ping**: `" + Math.round(Client.ws.ping) + " ms`" +
                "\n**Uptime**: `" + Util.msToTime(Client.uptime) + "`")
        );
    }
};
