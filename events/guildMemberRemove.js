const Client = require("../Client");
const Libs = require("../Libs");
const {Config, Util} = Libs;

Client.on("guildMemberRemove", async member => {
    // FIXME Moving this here might not fix DB closed-state issues.
    const {Keyv} = Libs;
    const {guild, user} = member;

    const roles = member.roles ? member.roles.cache.filter(r => r.id !== guild.id) : null;
    Util.log(guild, embed => embed.setColor(Config.color.logs.guildMemberRemove)
        .setTitle("User Left")
        .setAuthor(user.tag)
        .setAuthorIcon(user.getAvatar())
        .setFooter("Member ID: " + user.id)
        .setDescription("New member count: **" + guild.memberCount + "**" +
            "\n\n**Mention:** " + member.toString() +
            "\n**Join Date:** `" + member.joinedAt.toLocalFormat() + "`" +
            (member.nickname ? "\n**Had Nickname:** " + member.nickname : "") +
            (roles && roles.size ? "\n**Roles (" + roles.size + "):** " + roles.array().join(", ") : "")
        )
    );

    // Remove user from welcomer db.
    let db = await Keyv.get("special");
    if (db) {
        if (db.mhap && db.mhap.welcomer && db.mhap.welcomer[user.id]) {
            delete db.mhap.welcomer[user.id];
            await Keyv.set("special", db);
        }
        if (db.nl && db.nl.welcomer && db.nl.welcomer[user.id]) {
            delete db.nl.welcomer[user.id];
            await Keyv.set("special", db);
        }
    }
});
