const client = require("../bot");
const {config} = client;
client.on("guildMemberAdd", async member => {
    const {guild, user} = member;

    if(guild.id === config.guilds.mhapGuild) await member.roles.add(config.roles.unverified);

    config.log(guild, embed => embed.setColor(config.color.logs.guildMemberAdd)
        .setTitle("User Joined")
        .setAuthor("@" + user.username + "#" + user.discriminator, user.displayAvatarURL())
        .setFooter("Member ID: " + user.id)
        .setDescription("**Mention:** " + member.toString() + "\n**Join Position:** " + config.getJoinPosition(member) + "\n**Registered at:** `" + user.createdAt.toLocaleString() + "`"));

    const channel = guild.channels.resolve(config.channels.welcome);
    if(!channel) return;
    channel.send(config.embed("User " + user.username + " has joined!", "User " + member.toString() + " has joined the Discord server.\nNew member count: **" + guild.memberCount + "**", config.color.green));
});