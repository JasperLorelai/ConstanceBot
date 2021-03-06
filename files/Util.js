module.exports = {
    async discordAPI(code, redirect, request) {
        const {btoa, fetch, FormData, Config} = require("../Libs");
        const creds = "Basic " + btoa(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET);
        const form = new FormData();
        form.append("client_id", process.env.CLIENT_ID);
        form.append("client_secret", process.env.CLIENT_SECRET);
        form.append("grant_type", "authorization_code");
        form.append("code", code);
        form.append("redirect_uri", encodeURI(redirect));
        form.append("scope", "identify");
        const response = await fetch(Config.urls.discordAPI.oauth2 + "token", {
            method: "POST",
            body: form,
            headers: {Authorization: creds}
        }).then(y => y.json());
        return await fetch(request, {headers: {Authorization: "Bearer " + response["access_token"]}}).then(y => y.json());
    },
    log(guild, funct) {
        const {Config, Discord} = require("../Libs");
        if (!guild) return;
        const guildData = Config.getGuildData(guild.id);
        if (!guildData) return;

        const channel = guildData.channels && guildData.channels.logs ? guild.channels.resolve(guildData.channels.logs) : guild.channels.cache.find(c => c.name === "logs");
        if (!channel) return;
        // Let the dev make changes against this embed before sending.
        channel.send(funct(new Discord.MessageEmbed().setTimestamp(new Date())));
    },
    getJoinPosition(member) {
        return member.guild.members.cache.sort((a, b) => a.joinedAt - b.joinedAt).array().findIndex(m => m.id === member.id);
    },
    getBaseFooter() {
        const {Config} = require("../Libs");
        return "Bot made by: " + Config.author.username;
    },
    getBaseEmbed() {
        const {Config, Discord} = require("../Libs");
        return new Discord.MessageEmbed()
            .setColor(Config.color.base)
            .setFooterText(this.getBaseFooter())
            .setFooterIcon(Config.author.getAvatar())
            .setTimestamp(new Date());
    },
    embed(title, description, color) {
        const embed = this.getBaseEmbed();
        if (color) embed.setColor(color);
        if (title) embed.setTitle(title);
        if (description) embed.setDescription(description);
        return embed;
    },
    async handlePrompt(message, text, ttl, separator) {
        // Split text into segments based on the separator.
        let splits = [];
        if (!separator) separator = " ";
        let i = 0;
        while (text.length) {
            if (text.length < 2000) {
                splits.push(text);
                text = "";
                break;
            }
            const end = text.lastIndexOf(separator, i + 2000);
            splits.push(text.substring(i, end));
            text = text.substr(end);
            i += end;
        }
        // Setup
        const embed = message.getFirstEmbed();
        let index = 0;
        await message.edit(embed.setDescription(splits[0]).addField("Pages", "Page: " + (index + 1) + "**/**" + splits.length, true));
        await message.react("◀");
        await message.react("▶");
        // Collector events
        const coll = message.createReactionCollector((r, u) => u.id !== message.client.user.id, {time: ttl || 90000});
        coll.on("collect", async (r, u) => {
            let emoji = r.emoji.toString();
            if (emoji === "▶") {
                index++;
                if (index >= splits.length) index = 0;
            }
            if (emoji === "◀") {
                index--;
                if (index < 0) index = splits.length - 1;
            }
            await message.edit(embed.setDescription(splits[index]).spliceFields(0, 1, {name: "Pages", value: "Page: " + (index + 1) + "**/**" + splits.length, inline: true}));
            await r.users.remove(u.id);
        });
        coll.on("end", async () => {
            await message.edit(embed.spliceFields(0, 1));
            await message.reactions.removeAll();
            await message.react("❤");
        });
    },
    findGuildMember(find, guild) {
        return guild.members.cache.find(m => find === m.id || find === m.user.username || find.substring(2, find.length - 1) === m.id || find.substring(3, find.length - 1) === m.id || m.user.username.toLowerCase().includes(find.toLowerCase()));
    },
    findUser(find) {
        const {Config} = require("../Libs");
        return Config.getClient().users.cache.find(u => find === u.id || find === u.username || find.substring(2, find.length - 1) === u.id || find.substring(3, find.length - 1) === u.id || u.username.toLowerCase().includes(find.toLowerCase()));
    },
    findRole(find, guild) {
        return guild.roles.cache.filter(r => r.id !== guild.id).find(r => find === r.id || find.substring(3, find.length - 1) === r.id || find.toLowerCase() === r.name.toLowerCase() || r.name.toLowerCase().includes(find.toLowerCase()));
    },
    findChannel(find, guild) {
        return guild.channels.cache.filter(c => c.id !== guild.id).find(c => find === c.id || find.substring(3, find.length - 1) === c.id || find.toLowerCase() === c.name.toLowerCase() || c.name.toLowerCase().includes(find.toLowerCase()));
    },
    getTextWidth(text, font) {
        const {Canvas} = require("../Libs");
        let ctx = Canvas.createCanvas(0, 0).getContext("2d");
        ctx.font = font;
        return ctx.measureText(text).width;
    },
    async handleChange(msg, author, modify, denied, accepted, options) {
        const {Config} = require("../Libs");
        if (!denied) denied = () => {};
        if (!accepted) accepted = () => {};
        let embed = msg.getFirstEmbed();
        await msg.edit(embed.setColor(Config.color.yellow).setDescription((embed.description ? embed.description : "") + "\n\n**React with:\n✅ - to confirm changes.\n❌ - deny changes.**"));
        await msg.react("❌");
        await msg.react("✅");
        const coll = msg.createReactionCollector((r, u) => u.id !== msg.client.user.id, {time: 30000});
        coll.on("collect", async (r, u) => {
            await r.users.remove(u.id);
            if (author.id !== u.id) return;
            embed = msg.getFirstEmbed();
            switch (r.emoji.toString()) {
                case "❌":
                    denied(modify);
                    if (options.denied) embed.setDescription(options.denied);
                    await msg.edit(embed.setColor(Config.color.red));
                    coll.stop("denied");
                    break;
                case "✅":
                    accepted(modify);
                    if (options.accepted) embed.setDescription(options.accepted);
                    await msg.edit(embed.setColor(Config.color.green));
                    coll.stop("accepted");
                    break;
            }
        });
        coll.on("end", async (c, reason) => {
            if (msg.deleted) return;
            const embed = msg.getFirstEmbed();
            if (!["denied", "accepted"].includes(reason)) embed.setColor("666666").setDescription("Timed out.");
            if (reason === "denied" && !options.denied) embed.setDescription("");
            if (reason === "accepted" && !options.accepted) embed.setDescription("");
            if (options.newTitle) embed.setTitle(options.newTitle);
            await msg.edit(embed);
            await msg.reactions.removeAll();
        });
    },
    collTtl(coll, created) {
        return coll.options.time - (Date.now() - created);
    },
    getRoleByPerm(member, perm) {
        return member.roles.cache.array()
            .filter(r => r.id !== member.guild.id)
            .sort((a, b) => b.position - a.position)
            // Find highest admin, otherwise highest with said permission.
            .find(r => r.permissions.has("ADMINISTRATOR") || (r.permissions.has(perm) || null));
    },
    async hasPerm(user, guild, perm) {
        const {Config, Keyv} = require("../Libs");
        if (!perm) return true;
        // Exit if user is author.
        const isAuthor = user.id === Config.author.id;
        if (isAuthor) return true;
        if (perm === "author") return isAuthor;
        // Exit of nothing else can be processed.
        if (!guild) return true;
        const member = guild.members.resolve(user);
        if (!member) return true;
        const isAdmin = member.permissions.has("ADMINISTRATOR");
        if (isAdmin) return true;
        if (perm === "admin") return isAdmin;
        if (perm === "mod") {
            const db = await Keyv.get("guilds");
            let mods = null;
            if (db && db[guild.id] && db[guild.id].mods) {
                mods = db[guild.id].mods;
            }
            if (!mods) return false;
            if (mods["users"] && mods["users"].includes(user.id)) return true;
            if (mods["roles"]) {
                const roles = member.roles.cache;
                for (const role of mods["roles"]) {
                    if (roles.has(role)) {
                        return true;
                    }
                }
            }
            // Mod permission still expected.
            return false;
        }
        // This should pass if permission type is invalid.
        Config.botLog().send(Config.author.toString(), this.embed("Checking Permission", "Bot is trying to check for a an invalid permission: " + perm, Config.color.red));
        return true;
    },
    msToTime(ms) {
        const days = Math.floor(ms / 86400000);
        const hours = Math.floor(ms % 86400000 / 3600000);
        const minutes = Math.floor(ms % 3600000 / 60000);
        const seconds = Math.floor(ms % 60000 / 1000);

        let str = [];
        if (days) str.push(days + " days");
        if (hours) str.push(hours + " hours");
        if (minutes) str.push(minutes + " minutes");
        if (seconds) str.push(seconds + " seconds");

        return str.join(", ");
    },
    async getRequest(url, output) {
        const {fetch} = require("../Libs");
        return await fetch(url).then(y => {
            if (output === "json") return y.json();
            return y.text();
        });
    },
    async getServer(serverIP) {
        const {Config} = require("../Libs");
        return await this.getRequest(Config.urls.mcServerQuery + serverIP,"json");
    },
    async getTrello(params) {
        const {Config} = require("../Libs");
        return await this.getRequest(Config.urls.trello + params + "?key=" + process.env.TRELLO_KEY + "&token=" + process.env.TRELLO_TOKEN, "json");
    }
};
