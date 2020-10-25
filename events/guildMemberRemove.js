const Client = require("../bot");
const {Config, Util, keyv} = Client;
Client.on("guildMemberRemove", async member => {
    const {guild, user} = member;

    const roles = member.roles ? member.roles.cache.filter(r => r.id !== guild.id) : null;
    Util.log(guild, embed => embed.setColor(Config.color.logs.guildMemberRemove)
        .setTitle("User Left")
        .setAuthor(user.tag, user.displayAvatarURL())
        .setFooter("Member ID: " + user.id)
        .setDescription("New member count: **" + guild.memberCount + "**" +
            "\n\n**Mention:** " + member.toString() +
            "\n**Join Date:** `" + member.joinedAt.toLocaleString() + "`" +
            (member.nickname ? "\n**Had Nickname:** " + member.nickname : "") +
            (roles && roles.size ? "\n**Roles (" + roles.size + "):** " + roles.array().join(", ") : "")
        )
    );

    // Remove user from welcomer db.
    let db = await keyv.get("special");
    if (db) {
        if (db.mhap && db.mhap.welcomer && db.mhap.welcomer[user.id]) {
            delete db.mhap.welcomer[user.id];
            await keyv.set("special", db);
        }
        if (db.nl && db.nl.welcomer && db.nl.welcomer[user.id]) {
            delete db.nl.welcomer[user.id];
            await keyv.set("special", db);
        }
    }
});
