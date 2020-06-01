const client = require("../bot");
const {config, util} = client;
client.on("guildMemberAdd", async member => {
    const {guild, user} = member;

    util.log(guild, embed => embed.setColor(config.color.logs.guildMemberAdd)
        .setTitle("User Joined")
        .setAuthor("@" + user.username + "#" + user.discriminator, user.displayAvatarURL())
        .setFooter("Member ID: " + user.id)
        .setDescription("New member count: **" + guild.memberCount + "**\n\n**Mention:** " + member.toString() + "\n**Join Position:** " + util.getJoinPosition(member) + "\n**Registered at:** `" + user.createdAt.toLocaleString() + "`"));

    if (guild.id === config.guilds.mhapGuild) {
        await member.roles.add(config.roles.unverified);
        // noinspection JSUnresolvedFunction
        const server = JSON.parse(await client.fetch("https://api.mcsrvstat.us/2/" + config.hostname.mhap).then(y => y.text()));
        await member.send(util.embed("Welcome!", "Welcome to **" + guild.name + "**, a Minecraft server based on the **Boku No Hero Academia** manga and anime. The server is not modded. All of our content is made with the help of plugins and our wonderful content creators!" +
            "\n\n" + "**IP:** `" + config.hostname.mhap + "`" +
            (server.version ? "\n" + "**Version:** `" + server.version + "`" : "") +
            "\n" + "**Discord Invite:** http://mhaprodigy.uk/discord")
            .setThumbnail(guild.iconURL())
        );
    }
    if (guild.id === config.guilds.nlGuild) {
        await member.roles.add(config.roles.player);
        // noinspection JSUnresolvedFunction
        const server = JSON.parse(await client.fetch("https://api.mcsrvstat.us/2/" + config.hostname.nl).then(y => y.text()));
        await member.send(util.embed("Welcome!", "Welcome to **" + guild.name + "**, a Minecraft server based on the **Naruto** anime. The server is not modded. All of our content is made with the help of plugins and our wonderful staff!" +
            "\n\n" + "**IP:** `" + config.hostname.nl + "`" +
            (server.version ? "\n" + "**Version:** `" + server.version + "`" : "") +
            "\n" + "**Discord Invite:** https://discord.gg/Z9R4j7g")
            .setThumbnail(guild.iconURL())
        );
        // Start of the welcomer process. Everything else is handled in "handleMsg.js".
        /*
        if (!db) db = {};
        const {nlGuild} = config.guilds;
        if (!db[nlGuild]) db[nlGuild] = {};
        if (!db[nlGuild].welcomer) db[nlGuild].welcomer = {};
        const msg = await user.send(util.embed("Roles - Poll (Stage 1)", "Would you like to be mentioned whenever we release a server poll?\nPlease reply with `yes` or `no`.", config.color.yellow));
        db[nlGuild].welcomer[user.id] = msg.id;
        await keyv.set("guilds", db);
         */
    }
});
