module.exports = {
    name: "server",
    description: "Displays info of a minecraft server.",
    aliases: ["ip"],
    params: ["(ip)"],
    async execute(message, args) {
        const Client = message.client;
        const {channel, guild, author} = message;
        const {Config, Util} = Client;
        let ip = args[0];
        if (!ip) {
            ip = Config.getGuildData(guild.id);
            if (ip) ip = ip.hostname;
        }
        if (!ip) {
            channel.send(author.toString(), Util.embed("Minecraft Server Info", "Please provide an IP parameter.", Config.color.red));
            return;
        }
        const msg = await channel.send(Util.embed("Minecraft Server Info", "Pending information...", Config.color.yellow));
        const server = await Util.getServer(ip);
        let text = "";
        if (server.debug && server.debug.ping) {
            if (server.online) {
                text += "**Online:** " + server.online;
                let ip = server.ip + (server.port ? ":" + server.port : "");
                text += "\n**Address:** ";
                text += server.hostname ? "`" + server.hostname + "` **(**`" + ip + "`**)**" : "`" + ip + "`";
            }
            if (server["players"] && server["players"].list) {
                let {online, max, list} = server["players"];
                text += "\n**Players (**" + online + "/" + max + "**):** " + list.map(u => u.escapeMarkdown()).join("**,** ");
            }
            if (server.version) text += "\n**Version:** " + server.version;
            if (server["software"]) text += "\n**Software:** " + server["software"];
            if (server.map) text += "\n**Map:** " + server.map;
            if (server.plugins) text += "\n**Plugins (" + server.plugins.raw.length + "):** " + server.plugins.raw.join("**,** ");
            if (server["mods"]) text += "\n**Mods (" + server["mods"].raw.length + "):** " + server["mods"].names.join("**,** ");
         }
        else text = "**Server was not found.**";
        const embed = Util.embed("Minecraft Server Info", (text.length >= 2000 ? "" : text)).setColor(server.online ? Config.color.green : Config.color.red);
        if (server.icon) {
            embed.attachFiles([{
                attachment: Buffer.from(server.icon.replace(/\\/g, "").replace("data:image/png;base64,", "").replace("==", ""), "base64"),
                name: "bg.png"
            }]).setThumbnail("attachment://bg.png");
        }
        await msg.edit(embed);
        if (text.length >= 2000) await Util.handlePrompt(msg, text);
    }
};
