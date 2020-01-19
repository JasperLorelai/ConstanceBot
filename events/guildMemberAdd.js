const client = require("../bot");
const {config} = client;
client.on("guildMemberAdd", async member => {
    const {guild, user} = member;

    if(guild.id === config.guilds.mhapGuild) await member.roles.add(config.roles.unverified);

    config.log(guild, embed => embed.setColor(config.color.logs.guildMemberAdd)
        .setTitle("User Joined")
        .setAuthor("@" + user.username + "#" + user.discriminator, user.displayAvatarURL())
        .setFooter("Member ID: " + user.id)
        .setDescription("New member count: **" + guild.memberCount + "**\n\n**Mention:** " + member.toString() + "\n**Join Position:** " + config.getJoinPosition(member) + "\n**Registered at:** `" + user.createdAt.toLocaleString() + "`"));
});