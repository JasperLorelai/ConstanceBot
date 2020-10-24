const client = require("../bot");
const {config, util} = client;
client.on("guildMemberAdd", async member => {
    const {guild, user} = member;

    util.log(guild, embed => embed.setColor(config.color.logs.guildMemberAdd)
        .setTitle("User Joined")
        .setAuthor("@" + user.tag, user.displayAvatarURL())
        .setFooter("Member ID: " + user.id)
        .setDescription("New member count: **" + guild.memberCount + "**" +
            "\n\n**Mention:** " + member.toString() +
            "\n**Join Position:** " + util.getJoinPosition(member) +
            "\n**Registered at:** `" + user.createdAt.toLocaleString() + "`")
    );

    switch (guild.id) {
        case config.guildData.mhap.id: {
            const mhapData = config.guildData.mhap;
            await member.roles.add(mhapData.roles.unverified);
            const server = await util.getServer(mhapData.hostname);
            await member.send(util.embed("Welcome!", "Welcome to **" + guild.name + "**, a Minecraft server based on the **Boku No Hero Academia** manga and anime. The server is not modded. All of our content is made with the help of plugins and our wonderful content creators!" +
                "\n\n" + "**IP:** `" + mhapData.hostname + "`" +
                (server.version ? "\n" + "**Version:** `" + server.version + "`" : "") +
                "\n" + "**Discord Invite:** " + mhapData.invite)
                .setThumbnail(guild.iconURL())
            );
            break;
        }
        case config.guildData.nl.id: {
            const nlData = config.guildData.nl;
            await member.roles.add(nlData.roles.player);
            const server = await util.getServer(nlData.hostname);
            await member.send(util.embed("Welcome!", "Welcome to **" + guild.name + "**, a Minecraft server based on the **Naruto** anime. The server is not modded. All of our content is made with the help of plugins and our wonderful staff!" +
                "\n\n" + "**IP:** `" + nlData.hostname + "`" +
                (server.version ? "\n" + "**Version:** `" + server.version + "`" : "") +
                "\n" + "**Discord Invite:** " + nlData.invite)
                .setThumbnail(guild.iconURL())
            );

            // Send join message in guild.
            const channel = guild.channels.resolve(nlData.channels.general);
            if (!channel) return;
            channel.send(util.embed(member.user.username + " Joined", "Welcome " + member.toString() + " to **" + guild.name + "**. We hope you enjoy your stay.").setColorRandom().setThumbnail(member.user.displayAvatarURL()));

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
            break;
        }
        case config.guildData.cctwc.id: {
            const cctwcData = config.guildData.cctwc;
            const urls = config.urls.cctwc;
            await member.roles.add(cctwcData.roles.postulant);
            await member.send(util.embed("Welcome!" , "Welcome to **" + guild.name + "**!\n\n" +
                "> Here, you’ll be able to keep track of my hectic upload schedule and talk to fellow readers about the story!\n> \n" +
                "> You may feel free to speak your mind, but be sure to take a gander at the laws of the land to ensure you carry yourself in a respectable manner.\n\n" +
                "**Discord Invite:** " + cctwcData.invite + "\n" +
                "**Please support me on ko-fi:** " + urls.kofi + "\n" +
                "**Webnovel:** " + urls.webnovel
                )
                .setThumbnail(guild.iconURL())
            );

            const channel = guild.channels.resolve(cctwcData.channels.pedestal);
            if (!channel) return;
            channel.send(util.embed(member.user.username + " Joined", "Welcome " + member.toString() + " to **" + guild.name + "**. We hope you enjoy your stay.").setColorRandom().setThumbnail(member.user.displayAvatarURL()));
            break;
        }

    }

});
