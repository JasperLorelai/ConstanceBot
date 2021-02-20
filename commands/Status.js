module.exports = {
    name: "status",
    description: "Displays bot status.",
    async execute(Libs, message) {
        const {Util, Config} = require("../Libs");
        const Client = message.client;

        const msg = await message.reply(Util.embed("Bot Status", "Pinging...", Config.color.yellow));
        await msg.edit(msg.getFirstEmbed()
            .setColor(Config.color.base)
            .setDescription(
                "> **Server Ping**: `" + (msg.createdAt - message.createdAt) + " ms`" +
                "\n> **API Ping**: `" + Math.round(Client.ws.ping) + " ms`" +
                "\n> **Uptime**: `" + Util.msToTime(Client.uptime) + "`")
        );
    }
};
