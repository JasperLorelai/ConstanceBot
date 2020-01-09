const client = require("../bot");
const {config, keyv} = client;
client.on("messageReactionAdd", async (r, u) => {
    const {guild, channel} = r.message;
    // Rule accept.
    if(r.message.id !== config.messages.rules) return;
    if(r.emoji.toString() !== "✅") return;
    // TODO: Prevent repetative rule-accepting.
    // TODO: Remove comment.
    //await guild.members.resolve(u.id).roles.add(config.roles.verified);
    // TODO: Remove comment mid statement.
    await channel.send(config.embed("User " + u.username + " has accepted the rules!", u.toString() + " has accepted the rules and became a member of ***" + guild.name + "***! Count of people who accepted rules: **" + /*guild.roles.resolve(config.roles.verified).members.size + "/"*/ +guild.memberCount + "**."));
    await u.send(config.embed("Welcome!", "Welcome to **" + guild.name + "**, a Minecraft server based on the **Boku No Hero Academia** manga and anime. The server is not modded. All of our content is made with the help of plugins and our wonderful content creators!\n\n" + "**IP:** " + config.defaultIP + "\n" + "**Version:** Release 1.13.2\n" + "**Discord Invite:** http://discord.mhaprodigy.uk/\n"));
    let db = await keyv.get("guilds");
    // Start of the welcomer process. Everything else is handled in "handleMsg.js".
    if(!db) db = {};
    const {mhapGuild} = config.guilds;
    if(!db[mhapGuild]) db[mhapGuild] = {};
    if(!db[mhapGuild].welcomer) db[mhapGuild].welcomer = {};
    const msg = await u.send(config.embed("Roles - Poll (Stage 1)", "Would you like to be mentioned whenever we release a server poll?\nPlease reply with `yes` or `no`.", config.color.yellow));
    db[mhapGuild].welcomer[u.id] = msg.id;
    await keyv.set("guilds", db);
});