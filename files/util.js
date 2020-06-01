module.exports = {
    async discordAPI(code, redirect, request) {
        const client = require("../bot");
        const creds = "Basic " + client.btoa(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET);
        console.log("https://discordapp.com/api/oauth2/token?grant_type=authorization_code&redirect_uri=" + encodeURI(redirect) + "&code" + code);
        // noinspection JSUnresolvedFunction
        const response = await client.fetch("https://discordapp.com/api/oauth2/token?grant_type=authorization_code&redirect_uri=" + encodeURI(redirect) + "&code" + code, {
            method: "POST",
            headers: {Authorization: creds}
        }).then(y => {
            console.log(y);
            y.json()
        });
        console.log(response);
        // noinspection JSUnresolvedFunction, JSUnresolvedVariable
        return await client.fetch(request, {headers: {Authorization: "Bearer " + response.access_token}}).then(y => y.json());
    },
    log(guild, funct) {
        if (!guild) return;
        const channelID = this.config.channels.logs[guild.id];
        const channel = channelID ? guild.channels.resolve(channelID) : guild.channels.cache.find(c => c.name === "logs");

        // TODO: Remove this. This is just temporary global logs to help find conflicts.
        if (guild.id !== "406825495502782486") this.config.getMainGuild().channels.resolve(this.config.channels.globalLogs).send("`" + guild.id + ": " + channel + "` **" + guild.name + "**", funct(new this.config.discord.MessageEmbed().setTimestamp(new Date())));

        if (!channel) return;
        // Let the dev make changes against this embed before sending.
        channel.send(funct(new this.config.discord.MessageEmbed().setTimestamp(new Date())));
    },
    getJoinPosition(member) {
        return member.guild.members.cache.sort((a, b) => a.joinedAt - b.joinedAt).array().findIndex(m => m.id === member.id);
    },
    getBaseEmbed() {
        return new this.config.discord.MessageEmbed()
            .setColor(this.config.color.base)
            .setFooter("Bot made by: " + this.config.author.username, this.config.author.displayAvatarURL())
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
    getEmbeds(message) {
        if (message.embeds.length < 1) return null;
        return message.embeds.filter(e => e.type === "rich").map(e => {
            const embed = new this.config.discord.MessageEmbed(e);
            if (embed.image) embed.image.url = "attachment://" + embed.image.url.substr(embed.image.url.lastIndexOf("/") + 1);
            if (embed.thumbnail) embed.thumbnail.url = "attachment://" + embed.thumbnail.url.substr(embed.thumbnail.url.lastIndexOf("/") + 1);
            return embed;
        });
    },
    async handlePrompt(message, text, ttl, seperator) {
        // Split text into segments based on the seperator.
        let splits = [];
        if (!seperator) seperator = " ";
        let i = 0;
        while (text.length) {
            if (text.length < 2000) {
                splits.push(text);
                text = "";
                break;
            }
            const end = text.lastIndexOf(seperator, i + 2000);
            splits.push(text.substring(i, end));
            text = text.substr(end);
            i += end;
        }
        // Setup
        const embed = this.getEmbeds(message)[0];
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
            // noinspection JSCheckFunctionSignatures
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
        const client = require("../bot");
        return client.users.cache.find(u => find === u.id || find === u.username || find.substring(2, find.length - 1) === u.id || find.substring(3, find.length - 1) === u.id || u.username.toLowerCase().includes(find.toLowerCase()));
    },
    findRole(find, guild) {
        return guild.roles.cache.filter(r => r.id !== guild.id).find(r => find === r.id || find.substring(3, find.length - 1) === r.id || find.toLowerCase() === r.name.toLowerCase() || r.name.toLowerCase().includes(find.toLowerCase()));
    },
    findChannel(find, guild) {
        return guild.channels.cache.filter(c => c.id !== guild.id).find(c => find === c.id || find.substring(3, find.length - 1) === c.id || find.toLowerCase() === c.name.toLowerCase() || c.name.toLowerCase().includes(find.toLowerCase()));
    },
    isJSON(json) {
        try {if (typeof JSON.parse(json) == "object") return true} catch(e) {}
        return false;
    },
    isRegex(regex) {
        try {new RegExp(regex)} catch(e) {return false}
        return true;
    },
    hexToRGB(h) {
        let r = 0, g = 0, b = 0;
        if (h.length === 4) {
            r = "0x" + h[1] + h[1];
            g = "0x" + h[2] + h[2];
            b = "0x" + h[3] + h[3];
        }
        else if (h.length === 7) {
            r = "0x" + h[1] + h[2];
            g = "0x" + h[3] + h[4];
            b = "0x" + h[5] + h[6];
        }
        return [r, g, b];
    },
    hexToHSL(hex) {
        // Convert hex to RGB first
        let [r, g, b] = this.hexToRGB(hex);
        // Then to HSL
        r /= 255;
        g /= 255;
        b /= 255;
        let cmin = Math.min(r,g,b);
        let cmax = Math.max(r,g,b);
        let delta = cmax - cmin;
        let h = 0;
        let s = 0;
        let l = 0;
        if (delta === 0) h = 0;
        else if (cmax === r) h = ((g - b) / delta) % 6;
        else if (cmax === g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;
        h = Math.round(h * 60);
        if (h < 0) h += 360;
        l = (cmax + cmin) / 2;
        s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = + (s * 100).toFixed(1);
        l = + (l * 100).toFixed(1);
        return [h, s, l];
    },
    colorToHex(color) {
        let final = color.match(/([0-9]*(\.[0-9]*)?(?:[%|°])?)+/g).filter(e => e);
        if (color.startsWith("rgb(")) {
            return final.map(c => {
                if (c.endsWith("%")) return Math.round(c.substr(0, c.length - 1) / 100 * 255); else {
                    const str = (+c).toString(16);
                    return str.length === 1 ? "0" + str : str;
                }
            }).join("");
        }
        if (color.startsWith("hsl(")) {
            final = final.map(e => {
                if (e.endsWith("°") || e.endsWith("%")) return e.substr(0, e.length - 1); else return e;
            });
            const h = parseInt(final[0]) / 360;
            const s = parseInt(final[1]) / 100;
            const l = parseInt(final[2]) / 100;
            let r, g, b;
            if (s === 0) {
                r = g = b = l;
            }// Achromatic.
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
        const client = require("../bot");
        let ctx = client.canvas.createCanvas(0, 0).getContext("2d");
        ctx.font = font;
        return ctx.measureText(text).width;
    },
    async handleChange(msg, author, modify, denied, accepted, options) {
        if (!denied) denied = () => {};
        if (!accepted) accepted = () => {};
        let embed = this.getEmbeds(msg)[0];
        await msg.edit(embed.setColor(this.config.color.yellow).setDescription((embed.description ? embed.description : "") + "\n\n**React with:\n✅ - to confirm changes.\n❌ - deny changes.**"));
        await msg.react("❌");
        await msg.react("✅");
        const coll = msg.createReactionCollector((r, u) => u.id !== msg.client.user.id, {time: 30000});
        coll.on("collect", async (r, u) => {
            await r.users.remove(u.id);
            if (author.id !== u.id) return;
            embed = getEmbeds(msg)[0];
            switch (r.emoji.toString()) {
                case "❌":
                    denied(modify);
                    if (options.denied) embed.setDescription(options.denied);
                    await msg.edit(embed.setColor(this.config.color.red));
                    coll.stop("denied");
                    break;
                case "✅":
                    accepted(modify);
                    if (options.accepted) embed.setDescription(options.accepted);
                    await msg.edit(embed.setColor(this.config.color.green));
                    coll.stop("accepted");
                    break;
            }
        });
        coll.on("end", async (c, reason) => {
            if (msg.deleted) return;
            const embed = this.getEmbeds(msg)[0];
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
        return member.roles.cache.array()
            .filter(r => r.id !== member.guild.id)
            .sort((a, b) => b.position - a.position)
            // Find highest admin, otherwise highest with said permission.
            .find(r => r.permissions.has("ADMINISTRATOR") || (r.permissions.has(perm) || null));
    },
    getEmoji(str) {
        return str.match(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g);
    },
    async getPerms(member, perm) {
        const {guild} = member;
        let db = guild ? await guild.client.keyv.get("guilds") : null;
        let realPrefix = null;
        let mods = null;
        if (db && guild && db[guild.id] && db[guild.id].prefix) {
            realPrefix = db[guild.id].prefix;
            if (db[guild.id].mods) mods = db[guild.id].mods;
        }
        // Process permissions prior to execution.
        const isAuthor = member.id === this.config.author.id;
        const isAdmin = member ? member.hasPermission("ADMINISTRATOR") : false;
        // Different approach for mods.
        let isMod = false;
        const modRoles = mods ? mods["roles"] : null;
        if (modRoles) {
            for (let r of modRoles) {
                if (member.roles.cache.has(r)) {
                    isMod = true;
                    break;
                }
            }
        }
        const modUsers = mods ? mods["users"] : null;
        if (!isMod && modUsers) {
            for (let u of modUsers) {
                if (member.id === u) {
                    isMod = true;
                    break;
                }
            }
        }
        switch (perm) {
            case "author":
                return isAuthor;
            case "admin":
                return isAuthor || isAdmin;
            case "mod":
                return isAuthor || (isAdmin || isMod);
            case null:
            default:
                return true;
        }
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
    getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    },
    async handleError(message, error) {
        await message.channel.send(message.author.toString(), this.embed("Exception during command execution.", error, message.client.config.color.red));
    }
};
