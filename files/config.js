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
    mainDiscord: "575376952517591041",
    author: "192710597106728960",
    // Functions
    getAuthor(client) {
        return client.guilds.resolve(this.mainDiscord).members.resolve(this.author);
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
    /*
    findGuildMember(find, guild) {
        for(let m of guild.members) {
            // noinspection EqualityComparisonWithCoercionJS
            if(
                find == m[1].id ||
                find == m[1].user.username ||
                find.substring(2,find.length-1) == m[1].id ||
                find.substring(3,find.length-1) == m[1].id ||
                m[1].user.username.toLowerCase().includes(find.toLowerCase())
            ) return m[1];
        }
        return null;
    },
    */
    findRole(find, guild) {
        // noinspection EqualityComparisonWithCoercionJS
        return guild.roles.find(r =>
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
        return null;
    },
    getTextWidth(text, font) {
        let ctx = this.canvas.createCanvas(0,0).getContext("2d");
        ctx.font = font;
        return ctx.measureText(text).width;
    }
};