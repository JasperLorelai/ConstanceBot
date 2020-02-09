const client = require("../bot");
const {config, util} = client;
client.on("guildMemberAdd", async member => {
    const {guild, user} = member;

    if(guild.id === config.guilds.mhapGuild) await member.roles.add(config.roles.unverified);

    util.log(guild, embed => embed.setColor(config.color.logs.guildMemberAdd)
        .setTitle("User Joined")
        .setAuthor("@" + user.username + "#" + user.discriminator, user.displayAvatarURL())
        .setFooter("Member ID: " + user.id)
        .setDescription("New member count: **" + guild.memberCount + "**\n\n**Mention:** " + member.toString() + "\n**Join Position:** " + util.getJoinPosition(member) + "\n**Registered at:** `" + user.createdAt.toLocaleString() + "`"));

    if(guild.id === config.guilds.mhapGuild) await member.send(util.embed("Welcome!", "Welcome to **" + guild.name + "**, a Minecraft server based on the **Boku No Hero Academia** manga and anime. The server is not modded. All of our content is made with the help of plugins and our wonderful content creators!\n\n" + "**IP:** " + config.defaultIP + "\n" + "**Version:** Release 1.13.2\n" + "**Discord Invite:** http://mhaprodigy.uk/discord\n"));
});