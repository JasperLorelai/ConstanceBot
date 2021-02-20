const Client = require("../Client");
const {Config, Util} = require("../Libs");

Client.on("guildMemberAdd", async member => {
    const {guild, user} = member;

    Util.log(guild, embed => embed.setColor(Config.color.logs.guildMemberAdd)
        .setTitle("User Joined")
        .setAuthor("@" + user.tag)
        .setAuthorIcon(user.getAvatar())
        .setFooterText("Member ID: " + user.id)
        .setDescription("New member count: **" + guild.memberCount + "**" +
            "\n\n**Mention:** " + member.toString() +
            "\n**Join Position:** " + Util.getJoinPosition(member) +
            "\n**Registered at:** `" + user.createdAt.toLocalFormat() + "`")
    );

    switch (guild.id) {
        case Config.guildData.mhap.id: {
            const mhapData = Config.guildData.mhap;
            await member.roles.add(mhapData.roles.unverified);
            const server = await Util.getServer(mhapData.hostname);
            await member.send(Util.embed("Welcome!", "Welcome to **" + guild.name + "**, a Minecraft server based on the **Boku No Hero Academia** manga and anime. The server is not modded. All of our content is made with the help of plugins and our wonderful content creators!" +
                "\n\n" + "**IP:** `" + mhapData.hostname + "`" +
                (server.version ? "\n" + "**Version:** `" + server.version + "`" : "") +
                "\n" + "**Discord Invite:** " + mhapData.invite)
                .setThumbnailPermanent(guild.iconURL())
            ).catch(() => {});
            break;
        }
        case Config.guildData.nl.id: {
            const nlData = Config.guildData.nl;
            await member.roles.add(nlData.roles.player);
            const server = await Util.getServer(nlData.hostname);
            await member.send(Util.embed("Welcome!", "Welcome to **" + guild.name + "**, a Minecraft server based on the **Naruto** anime. The server is not modded. All of our content is made with the help of plugins and our wonderful staff!" +
                "\n\n" + "**IP:** `" + nlData.hostname + "`" +
                (server.version ? "\n" + "**Version:** `" + server.version + "`" : "") +
                "\n" + "**Discord Invite:** " + nlData.invite)
                .setThumbnailPermanent(guild.iconURL())
            ).catch(() => {});

            // Send join message in guild.
            const channel = guild.channels.resolve(nlData.channels.general);
            if (!channel) return;
            channel.send(Util.embed(member.user.username + " Joined", "Welcome " + member.toString() + " to **" + guild.name + "**. We hope you enjoy your stay.").setColorRandom().setThumbnailPermanent(member.user.getAvatar()));

            // Start of the welcomer process.
            if (!nlData.welcomer || !nlData.welcomer.length) return;
            const first = nlData.welcomer[0];
            if (!first || !first.text) return;
            let embed = Util.embed("Notification Roles", first.text);
            embed = embed.setFooterText("Welcomer | " + nlData.id + "_0 | " + embed.footer.text);
            const msg = await member.send(embed);
            await msg.react("✅");
            await msg.react("❌");
            break;
        }
        case Config.guildData.cctwc.id: {
            const cctwcData = Config.guildData.cctwc;
            const urls = Config.urls.cctwc;
            await member.roles.add(cctwcData.roles.postulant);
            await member.send(Util.embed("Welcome!" , "Welcome to **" + guild.name + "**!\n\n" +
                "> Here, you’ll be able to keep track of my hectic upload schedule and talk to fellow readers about the story!\n> \n" +
                "> You may feel free to speak your mind, but be sure to take a gander at the laws of the land to ensure you carry yourself in a respectable manner.\n\n" +
                "**Discord Invite:** " + cctwcData.invite + "\n" +
                "**Please support me on ko-fi:** " + urls.kofi + "\n" +
                "**Webnovel:** " + urls.webnovel
                )
                .setThumbnailPermanent(guild.iconURL())
            ).catch(() => {});

            const channel = guild.channels.resolve(cctwcData.channels.pedestal);
            if (!channel) return;
            channel.send(Util.embed(member.user.username + " Joined", "Welcome " + member.toString() + " to **" + guild.name + "**. We hope you enjoy your stay.").setColorRandom().setThumbnailPermanent(member.user.getAvatar()));

            // Start of the welcomer process.
            if (!cctwcData.welcomer || !cctwcData.welcomer.length) return;
            const first = cctwcData.welcomer[0];
            if (!first || !first.text) return;
            let embed = Util.embed("Notification Roles", first.text);
            embed = embed.setFooterText("Welcomer | " + cctwcData.id + "_0 | " + embed.footer.text);
            const msg = await member.send(embed);
            await msg.react("✅");
            await msg.react("❌");
            break;
        }

    }

});
