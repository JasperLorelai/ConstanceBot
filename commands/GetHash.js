module.exports = {
    name: "gethash",
    description: "Generates Sha1 checksum of the provided file.",
    guildOnly: false,
    async execute(Libs, message) {
        const {Util, fetch, sha1, ConditionException} = Libs;

        const pack = message.attachments ? message.attachments.find(a => a.name.endsWith(".zip")) : null;
        if (!pack) throw new ConditionException(message, "Sha1 Checksum Failed", "No attachment provided (must end with `zip` file extension).");
        const buffer = await fetch(pack.url).then(y => y.buffer());
        await message.delete();
        const hash = sha1(buffer);
        message.reply("", {
            embed: Util.embed("Sha1 Checksum Generated", "`" + hash + "`"),
            files: [{
                attachment: buffer,
                name: hash + ".zip"
            }]
        });
    }
};
