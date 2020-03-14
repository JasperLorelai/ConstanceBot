const client = require("../bot");
const {config, util, keyv} = client;
client.on("guildMemberRemove", async member => {
    const {guild, user} = member;

    const roles = member.roles ? member.roles.cache.filter(r => r.id !== guild.id) : null;
    util.log(guild, embed => embed.setColor(config.color.logs.guildMemberRemove)
        .setTitle("User Left")
        .setAuthor(user.tag, user.displayAvatarURL())
        .setFooter("Member ID: " + user.id)
        .setDescription("New member count: **" + guild.memberCount + "**\n\n**Mention:** " + member.toString() + "\n**Join Date:** `" + member.joinedAt.toLocaleString() + "`" + (member.nickname ? "\n**Had Nickname:** " + member.nickname : "") + (roles ? "\n**Roles (" + roles.size + "):** " + roles.array().join(", ") : "")));

    // Remove user from welcomer db.
    let db = await keyv.get("special");
    if(db && db.mhap && db.mhap.welcomer && db.mhap.welcomer[u.id]) {
        delete db.mhap.welcomer[u.id];
        await keyv.set("special", db);
    }
});
