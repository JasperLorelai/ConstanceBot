module.exports = {
    discord: require("discord.js"),
    // Properties
    token: "NTc5NzU5OTU4NTU2NjcyMDEx.XZcc5A.TDZBLpHFRSwLGRAr74BA0LIn_jA",
    globalPrefix: "&",
    defaultIP: "mhaprodigy.uk",
    color: {
        green: "04ff00",
        yellow: "fcba03",
        red: "ff0000",
        gray: "5c5c5c",
        base: "009dff"
    },
    guilds: {
        mainGuild: "575376952517591041"
    },
    channels: {
        botLogs: "575738387307298831"
    },
    categories: {
        dmChannels: "632697494865707008"
    },
    trello: {
        characters: "9qhuraUB",
        quirks: {
            roster: "uEL55Rqn"
        }
    },
    // Functions
    //modlogs: {
    //async get(guild, user) {
    // TODO: Add per user.
    //if(!user) return await guild.client.keyv.get("modlogs." + guild.id) || [];
    //else return null;
    //},
    //async add(type, guild, user, mod, reason, time) {
    //const keyv = guild.client.keyv;
    //const logs = await keyv.get("modlogs." + guild.id) || [];
    //logs.push({
    //type: type,
    //user: user,
    //mod: mod,
    //reason: reason || null,
    //time: time || new Date().getTime()
    //});
    //await keyv.set("modlogs." + guild.id, logs);
    //}
    //},
    getClient() {
        return require("../bot");
    },
    getMainGuild() {
        return this.getClient().guilds.resolve(this.guilds.mainGuild);
    },
    getBaseEmbed() {
        const user = this.author.user;
        return new this.discord.MessageEmbed()
            .setColor(this.color.base)
            .setFooter("Bot made by: " + user.username, user.displayAvatarURL())
            .setTimestamp(new Date());
    },
    embed(title, description, color) {
        const embed = this.getBaseEmbed();
        if (color) {
            const col = this.colorToHex(color);
            embed.setColor(col ? col : color);
        }
        if (title) embed.setTitle(title);
        if (description) embed.setDescription(description);
        return embed;
    },
    getEmbed(message) {
        if (message.embeds.length < 1) return;
        const embed = new this.discord.MessageEmbed(message.embeds.filter(e => e.type === "rich")[0]);
        if (embed.image) embed.image.url = "attachment://" + embed.image.url.substr(embed.image.url.lastIndexOf("/") + 1);
        return embed;
    },
    async handlePrompt(message, text, ttl, separator) {
        // Splitting text into pages
        if (!separator) separator = "\n";
        let split = [];
        for (let i = 0; i <= text.length; i += text.lastIndexOf(separator, i + 2048)) {
            split.push(text.substring(i, text.lastIndexOf(separator, i + 2048)));
            if (i === text.lastIndexOf(separator, i + 2048)) split[split.length - 1] = text.substring(i, i + 2048);
        }
        // Setup
        const embed = this.getEmbed(message);
        let index = 0;
        await message.edit(embed.setDescription(split[0]).addField("Pages", "Page: " + (index + 1) + "**/**" + split.length, true));
        await message.react("◀");
        await message.react("▶");
        // Collector events
        const coll = message.createReactionCollector((r, u) => u.id !== message.client.user.id, {time: ttl ? ttl : 90000});
        coll.on("collect", async (r, u) => {
            let emoji = r.emoji.toString();
            if (emoji === "▶") {
                index++;
                if (index >= split.length) index = 0;
            }
            if (emoji === "◀") {
                index--;
                if (index < 0) index = split.length - 1;
            }
            await message.edit(embed.setDescription(split[index]).spliceField(0, 1, "Pages", "Page: " + (index + 1) + "**/**" + split.length, true));
            await r.users.remove(u);
        });
        coll.on("end", async () => {
            await message.edit(embed.spliceField(0, 1));
            await message.reactions.removeAll();
            await message.react("❤");
        });
    },
    findGuildMember(find, guild) {
        // noinspection EqualityComparisonWithCoercionJS
        return guild.members.find(m =>
            find == m.id ||
            find == m.user.username ||
            find.substring(2, find.length - 1) == m.id ||
            find.substring(3, find.length - 1) == m.id ||
            m.user.username.toLowerCase().includes(find.toLowerCase())
        );
    },
    findUser(find) {
        // noinspection EqualityComparisonWithCoercionJS
        return this.getClient().users.find(u =>
            find == u.id ||
            find == u.username ||
            find.substring(2, find.length - 1) == u.id ||
            find.substring(3, find.length - 1) == u.id ||
            u.username.toLowerCase().includes(find.toLowerCase())
        );
    },
    findRole(find, guild) {
        // noinspection EqualityComparisonWithCoercionJS
        return guild.roles.filter(r => r.id !== guild.id).find(r =>
            find == r.id ||
            find.substring(3, find.length - 1) == r.id ||
            find.toLowerCase() == r.name.toLowerCase() ||
            r.name.toLowerCase().includes(find.toLowerCase())
        );
    },
    findChannel(find, guild) {
        // noinspection EqualityComparisonWithCoercionJS
        return guild.channels.filter(c => c.id !== guild.id).find(c =>
            find == c.id ||
            find.substring(3, find.length - 1) == c.id ||
            find.toLowerCase() == c.name.toLowerCase() ||
            c.name.toLowerCase().includes(find.toLowerCase())
        );
    },
    isJSON(json) {
        try {
            if (typeof JSON.parse(json) == "object") return true
        } catch (e) {
        }
        return false;
    },
    isRegex(regex) {
        try {
            new RegExp(regex)
        } catch (e) {
            return false
        }
        return true;
    },
    colorToHex(color) {
        let final = color.match(/([0-9]*(\.[0-9]*)?(?:[%|°])?)+/g).filter(e => e);
        if (color.startsWith("rgb(")) return final.map(c => {
            if (c.endsWith("%")) return Math.round(c.substr(0, c.length - 1) / 100 * 255);
            else {
                const str = (+c).toString(16);
                return str.length === 1 ? "0" + str : str;
            }
        }).join("");
        if (color.startsWith("hsl(")) {
            final = final.map(e => {
                if (e.endsWith("°") || e.endsWith("%")) return e.substr(0, e.length - 1);
                else return e;
            });
            const h = parseInt(final[0]) / 360;
            const s = parseInt(final[1]) / 100;
            const l = parseInt(final[2]) / 100;
            let r, g, b;
            if (s === 0) r = g = b = l; // Achromatic.
            else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                };
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            const toHex = x => {
                const hex = Math.round(x * 255).toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            };
            return toHex(r) + toHex(g) + toHex(b);
        }
        if (color.startsWith("#")) return color.substr(1);
        return null;
    },
    getTextWidth(text, font) {
        let ctx = this.getClient().canvas.createCanvas(0, 0).getContext("2d");
        ctx.font = font;
        return ctx.measureText(text).width;
    },
    async handleChange(msg, author, modify, denied, accepted, options) {
        if (!denied) denied = () => {
        };
        if (!accepted) accepted = () => {
        };
        let embed = this.getEmbed(msg);
        await msg.edit(embed.setColor(this.color.yellow).setDescription((embed.description ? embed.description : "") + "\n\n**React with:\n✅ - to confirm changes.\n❌ - deny changes.**"));
        await msg.react("❌");
        await msg.react("✅");
        const coll = msg.createReactionCollector((r, u) => u.id !== msg.client.user.id, {time: 30000});
        coll.on("collect", async (r, u) => {
            await r.users.remove(u);
            if (author.id !== u.id) return;
            embed = this.getEmbed(msg);
            switch (r.emoji.toString()) {
                case "❌":
                    denied(modify);
                    if (options.denied) embed.setDescription(options.denied);
                    await msg.edit(embed.setColor(this.color.red));
                    coll.stop("denied");
                    break;
                case "✅":
                    accepted(modify);
                    if (options.accepted) embed.setDescription(options.accepted);
                    await msg.edit(embed.setColor(this.color.green));
                    coll.stop("accepted");
                    break;
            }
        });
        coll.on("end", async (c, reason) => {
            if (msg.deleted) return;
            const embed = this.getEmbed(msg);
            if (!["denied", "accepted"].includes(reason)) embed.setColor("666666").setDescription("Timed out.");
            if (reason === "denied" && !options.denied) embed.setDescription("");
            if (reason === "accepted" && !options.accepted) embed.setDescription("");
            if (options.newTitle) embed.setTitle(options.newTitle);
            await msg.edit(embed);
            await msg.reactions.removeAll();
        });
    },
    collTtl(coll, created) {
        return coll.options.time - (new Date().getTime() - created);
    },
    getRoleByPerm(member, perm) {
        return member.roles.array()
            .filter(r => r.id !== member.guild.id)
            .sort((a, b) => b.position - a.position)
            // Find highest admin, otherwise highest with said permission.
            .find(r => r.permissions.has("ADMINISTRATOR") || (r.permissions.has(perm) || null));
    },
    getEmoji(str) {
        return str.match(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g);
    }
};