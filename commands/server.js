module.exports = {
    name: "server",
    description: "Displays info of a minecraft server.",
    aliases: ["ip"],
    params: ["(ip)"],
    async execute(message, args) {
        const {client, channel} = message;
        const config = client.config;
        const {red, green} = config.color;
        const server = JSON.parse(await client.fetch("https://api.mcsrvstat.us/2/" + (args[0] ? args[0] : config.defaultIP)).then(y => y.text()));
        let text = "";
        if(server.debug && server.debug.ping) {
            if(server.online) {
                text += "**Online:** " + server.online;
                let ip = server.ip + (server.port ? ":" + server.port : "");
                text += "\n**Address:** ";
                text += server.hostname ? "`" + server.hostname + "` **(**`" + ip + "`**)**" : "`" + ip + "`";
            }
            if(server["players"] && server["players"].list) {
                let {online, max, list} = server["players"];
                text += "\n**Players (**" + online + "/" + max + "**):** " + list.join("**,** ");
            }
            if(server.version) text += "\n**Version:** " + server.version;
            if(server["software"]) text += "\n**Software:** " + server["software"];
            if(server.map) text += "\n**Map:** " + server.map;
            if(server.plugins) text += "\n**Plugins (" + server.plugins.raw.length + "):** " + server.plugins.raw.join("**,** ");
            if(server["mods"]) text += "\n**Mods (" + server["mods"].raw.length + "):** " + server["mods"].names.join("**,** ");
        }
        else text = "**Server was not found.**";
        const embed = config.embed("Minecraft Server Info", (text.length >= 2000 ? "" : text)).setColor(server.online ? green : red);
        if(server.icon) {
            embed.attachFiles([{
                attachment: Buffer.from(server.icon.replace(/\\/g, "").replace("data:image/png;base64,", "").replace("==", ""), "base64"),
                name: "bg.png"
            }]).setThumbnail("attachment://bg.png");
        }
        const msg = await channel.send(embed);
        if(text.length >= 2000) await config.handlePrompt(msg, text);
    }
};