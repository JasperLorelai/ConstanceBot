module.exports = {
    name: "server",
    description: "Displays info of a minecraft server.",
    aliases: ["ip"],
    params: ["(ip)"],
    async execute(Libs, message, args) {
        const {Config, Util, ConditionException} = Libs;

        let ip = args[0];
        if (!ip) {
            ip = Config.getGuildData(message.guild.id);
            if (ip) ip = ip.hostname;
        }
        if (!ip) throw new ConditionException(message, "Minecraft Server Info", "Please provide an IP parameter.");
        const msg = await message.reply(Util.embed("Minecraft Server Info", "Pending information...", Config.color.yellow));
        const server = await Util.getServer(ip);
        let text = "";
        if (server.debug && server.debug.ping) {
            if (server.online) {
                text += "> **Status:** `" + (server.online ? "Online" : "Offline") + "`";
                let ip = server.ip + (server.port ? ":" + server.port : "");
                text += "\n> **Address:** ";
                text += server.hostname ? "`" + server.hostname + "` **(**`" + ip + "`**)**" : "`" + ip + "`";
            }
            if (server["players"] && server["players"].list) {
                let {online, max, list} = server["players"];
                text += "\n> **Players (**" + online + "/" + max + "**):** " + list.map(u => u.escapeMarkdown()).join("**,** ");
            }
            if (server.version) text += "\n> **Version:** " + server.version;
            if (server["software"]) text += "\n> **Software:** " + server["software"];
            if (server.map) text += "\n> **Map:** " + server.map;
            if (server.plugins) text += "\n> **Plugins (" + server.plugins.raw.length + "):** " + server.plugins.raw.join("**,** ");
            if (server["mods"]) text += "\n> **Mods (" + server["mods"].raw.length + "):** " + server["mods"].names.join("**,** ");
        }
        else text = "> **Server was not found.**";
        let embed = Util.embed("Minecraft Server Info", (text.length >= 2000 ? "" : text)).setColor(server.online ? Config.color.green : Config.color.red);
        if (server.icon) embed = embed.setThumbnailPermanent(server.icon.getBufferFromString());
        msg.delete();
        const newMsg = await message.reply(embed);
        if (text.length >= 2000) await Util.handlePrompt(newMsg, text);
    }
};
