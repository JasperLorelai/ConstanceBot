module.exports = {
    // Libraries
    discord: require("discord.js"),
    fetch: require("node-fetch"),
    // Properties
    token: "NTc5NzU5OTU4NTU2NjcyMDEx.XY-HQA.XOChzBf1IZPMkwUjENzNs_1jJhc",
    globalPrefix: "&",
    baseEmbedColor: "009dff",
    mainDiscord: "575376952517591041",
    author: "192710597106728960",
    // Functions
    getAuthor(client) {
        return client.guilds.resolve(this.mainDiscord).members.resolve(this.author);
    },
    async getBaseEmbed(client) {
        const user = this.getAuthor(client).user;
        const image = await this.fetch(user.displayAvatarURL());
        return new this.discord.MessageEmbed()
            .setColor(this.baseEmbedColor)
            .attachFiles([{
                name: "user-icon.png",
                attachment: image
            }])
            .setFooter("Bot made by: " + user.username, "attachment://user-icon.png")
            .setTimestamp(new Date());
    },
    async embed(client, title, description, color) {
        const embed = await this.getBaseEmbed(client);
        if(color) embed.setColor(color);
        embed.setTitle(title);
        embed.setDescription(description);
        return embed;
    },
    getEmbed(message) {
        if(!message.embeds[0]) return;
        let richFound = false;
        for(let e of message.embeds) if(e.type === "rich") richFound = true;
        if(!richFound) return;
        let index = -1;
        message.embeds.forEach((e, i) => {if(e.type === "rich") index = i});
        return new this.discord.MessageEmbed(message.embeds[index]);
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
        const embed = await this.getEmbed(message);
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
    }
};