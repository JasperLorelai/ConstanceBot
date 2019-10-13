module.exports = {
    // Libraries
    discord: require("discord.js"),
    fetch: require("node-fetch"),
    canvas: require("canvas"),
    fs: require("fs"),
    // Properties
    token: "NTc5NzU5OTU4NTU2NjcyMDEx.XZcc5A.TDZBLpHFRSwLGRAr74BA0LIn_jA",
    globalPrefix: "&",
    baseEmbedColor: "009dff",
    users: {
        author: "192710597106728960"
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
    // Functions
    modlogs: {
        async get(guild, user) {
            if(!user) return await this.keyv.get("modlogs." + guild) || [];
            else return null;
        },
        async add(type, guild, keyv, user, mod, reason, time) {
            const logs = await keyv.get("modlogs." + guild) || [];
            logs.push({
                type: type,
                user: user,
                mod: mod,
                reason: reason || null,
                time: time || new Date().getTime()
            });
            await keyv.set("modlogs." + guild, logs);
        }
    },
    getMainGuild(client) {
        return client.guilds.resolve(this.guilds.mainGuild);
    },
    getAuthor(client) {
        return this.getMainGuild(client).members.resolve(this.users.author);
    },
    getBaseEmbed(client) {
        const user = this.getAuthor(client).user;
        return new this.discord.MessageEmbed()
            .setColor(this.baseEmbedColor)
            .setFooter("Bot made by: " + user.username, user.displayAvatarURL())
            .setTimestamp(new Date());
    },
    embed(client, title, description, color) {
        const embed = this.getBaseEmbed(client);
        if(color) {
            const col = this.colorToHex(color);
            embed.setColor(col ? col : color);
        }
        if(title) embed.setTitle(title);
        if(description) embed.setDescription(description);
        return embed;
    },
    getEmbed(message) {
        if(message.embeds.length < 1) return;
        const embed = new this.discord.MessageEmbed(message.embeds.filter(e => e.type === "rich")[0]);
        if(embed.image) embed.image.url = "attachment://" + embed.image.url.substr(embed.image.url.lastIndexOf("/")+1);
        return embed;
    },
    async handlePrompt(message, text, ttl, separator) {
        // Splitting text into pages
        if(!separator) separator = "\n";
        let split = [];
        for(let i = 0; i <= text.length; i+=text.lastIndexOf(separator, i+2048)) {
            split.push(text.substring(i, text.lastIndexOf(separator, i+2048)));
            if(i === text.lastIndexOf(separator, i+2048)) split[split.length-1] = text.substring(i, i+2048);
        }
        // Setup
        const embed = this.getEmbed(message);
        let index = 0;
        await message.edit(embed.setDescription(split[0]).addField("Pages","Page: " + (index+1), true));
        await message.react("◀");
        await message.react("▶");
        // Collector events
        const coll = message.createReactionCollector((r,u) => u.id !== message.client.user.id, {time: ttl ? ttl : 90000});
        coll.on("collect", async (r, u) => {
            let emoji = r.emoji.toString();
            if(emoji === "▶") {
                index++;
                if(index >= split.length) index = 0;
            }
            if(emoji === "◀") {
                index--;
                if(index < 0) index = split.length-1;
            }
            await message.edit(embed.setDescription(split[index]).spliceField(0,1,"Pages","Page: " + (index+1), true));
            await r.users.remove(u);
        });
        coll.on("end", async () => {
            await message.edit(embed.spliceField(0,1));
            await message.reactions.removeAll();
            await message.react("❤");
        });
    },
    findGuildMember(find, guild) {
        // noinspection EqualityComparisonWithCoercionJS
        return guild.members.find(m =>
            find == m.id ||
            find == m.user.username ||
            find.substring(2,find.length-1) == m.id ||
            find.substring(3,find.length-1) == m.id ||
            m.user.username.toLowerCase().includes(find.toLowerCase())
        );
    },
    findRole(find, guild) {
        // noinspection EqualityComparisonWithCoercionJS
        return guild.roles.filter(r => r.id !== guild.id).find(r =>
            find == r.id ||
            find.substring(3,find.length-1) == r.id ||
            find.toLowerCase() == r.name.toLowerCase() ||
            r.name.toLowerCase().includes(find.toLowerCase())
        );
    },
    isJSON(json) {
        try {if(JSON.parse(json) && typeof JSON.parse(json) == "object") return true}
        catch(e) {}
        return false;
    },
    isRegex(regex) {
        try {new RegExp(regex)}
        catch(e) {return false}
        return true;
    },
    colorToHex(color) {
        let final = color.match(/([0-9]*(\.[0-9]*)?(?:[%|°])?)+/g).filter(e => e);
        if(color.startsWith("rgb(")) return final.map(c => {
            if(c.endsWith("%")) return Math.round(c.substr(0,c.length - 1)/100*255);
            else {
                const str = (+c).toString(16);
                return str.length === 1 ? "0" + str : str;
            }
        }).join("");
        if(color.startsWith("hsl(")) {
            final = final.map(e => {
                if(e.endsWith("°") || e.endsWith("%")) return e.substr(0, e.length-1);
                else return e;
            });
            const h = parseInt(final[0])/360;
            const s = parseInt(final[1])/100;
            const l = parseInt(final[2])/100;
            let r, g, b;
            if (s === 0) r = g = b = l; // Achromatic.
            else {
                const hue2rgb = (p, q, t) => {
                    if(t<0) t += 1;
                    if(t>1) t -= 1;
                    if(t<1/6) return p + (q-p) * 6 * t;
                    if(t<1/2) return q;
                    if(t<2/3) return p + (q-p) * (2/3-t) * 6;
                    return p;
                };
                const q = l<0.5 ? l*(1+s) : l+s-l*s;
                const p = 2*l-q;
                r = hue2rgb(p, q, h+1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h-1/3);
            }
            const toHex = x => {
                const hex = Math.round(x*255).toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            };
            return toHex(r) + toHex(g) + toHex(b);
        }
        if(color.startsWith("#")) return color.substr(1);
        return null;
    },
    getTextWidth(text, font) {
        let ctx = this.canvas.createCanvas(0,0).getContext("2d");
        ctx.font = font;
        return ctx.measureText(text).width;
    },
    async handleChange(msg, author, modify, denied, accepted, config) {
        if(!denied) denied = () => {};
        if(!accepted) accepted = () => {};
        let embed = this.getEmbed(msg);
        await msg.edit(embed.setColor("fcba03").setDescription((embed.description ? embed.description : "") + "\n\n**React with:\n✅ - to confirm changes.\n❌ - deny changes.**"));
        await msg.react("❌");
        await msg.react("✅");
        const coll = msg.createReactionCollector((r,u) => u.id !== msg.client.user.id, {time:30000});
        coll.on("collect", async (r,u) => {
            await r.users.remove(u);
            if(author.id !== u.id) return;
            embed = this.getEmbed(msg);
            switch (r.emoji.toString()) {
                case "❌":
                    denied(modify);
                    if(config.denied) embed.setDescription(config.denied);
                    await msg.edit(embed.setColor("ff0004"));
                    coll.stop("denied");
                    break;
                case "✅":
                    accepted(modify);
                    if(config.accepted) embed.setDescription(config.accepted);
                    await msg.edit(embed.setColor("04ff00"));
                    coll.stop("accepted");
                    break;
            }
        });
        coll.on("end", async (c,reason) => {
            if(msg.deleted) return;
            const embed = this.getEmbed(msg);
            if(!["denied","accepted"].includes(reason)) embed.setColor("666666").setDescription("Timed out.");
            if(reason === "denied" && !config.denied) embed.setDescription("");
            if(reason === "accepted" && !config.accepted) embed.setDescription("");
            if(config.newTitle) embed.setTitle(config.newTitle);
            await msg.edit(embed);
            await msg.reactions.removeAll();
        });
    },
    collTtl(coll,created) {
        return coll.options.time - (new Date().getTime()-created);
    },
    getRoleByPerm(member, perm) {
        return member.roles.array()
            .filter(r => r.id !== member.guild.id)
            .sort((a,b) => b.position - a.position)
            // Find highest admin, otherwise highest with said permission.
            .find(r => r.permissions.has("ADMINISTRATOR") || (r.permissions.has(perm) || null));
    }
};