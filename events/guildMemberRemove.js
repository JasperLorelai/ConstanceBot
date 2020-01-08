const client = require("../bot");
const {config, keyv} = client;
client.on("guildMemberRemove", async member => {
    const {guild, user} = member;

    const roles = member.roles ? member.roles.filter(r => r.id !== guild.id) : null;
    config.log(guild, embed => embed.setColor(config.color.logs.guildMemberRemove)
        .setTitle("User Left")
        .setAuthor("@" + user.username + "#" + user.discriminator, user.displayAvatarURL())
        .setFooter("Member ID: " + user.id)
        .setDescription("**Mention:** " + member.toString() + "\n**Join Date:** `" + member.joinedAt.toLocaleString() + "`" + "\n**Join Position:** " + config.getJoinPosition(member) + (member.nickname ? "\n**Had Nickname:** " + member.nickname : "") + (roles ? "\n**Roles (" + roles.size + "):** " + roles.array().join(", ") : "")));

    // Remove user from welcomer db.
    let db = await keyv.get("special");
    if(db && db.mhap && db.mhap.welcomer && db.mhap.welcomer[u.id]) {
        delete db.mhap.welcomer[u.id];
        await keyv.set("special", db);
    }

    const channel = guild.channels.resolve(config.channels.welcome);
    if(!channel) return;
    channel.send(config.embed("User " + user.username + " has left!", "User " + member.toString() + " has left the Discord server.\nNew member count: **" + guild.memberCount + "**", config.color.red));
});