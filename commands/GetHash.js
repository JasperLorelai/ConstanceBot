module.exports = {
    name: "gethash",
    description: "Generates Sha1 checksum of the provided file.",
    guildOnly: false,
    async execute(Libs, message) {
        const {Util, fetch, sha1, ConditionException} = Libs;
        const {author, channel} = message;

        const pack = message.attachments ? message.attachments.find(a => a.name.endsWith(".zip")) : null;
        if (!pack) throw new ConditionException(author, "Sha1 Checksum Failed", "No attachment provided (must end with `zip` file extension).");
        const buffer = await fetch(pack.url).then(y => y.buffer());
        message.delete({reason: "botIntent"});
        const hash = sha1(buffer);
        channel.send({
            embed: Util.embed("Sha1 Checksum Generated", "`" + hash + "`"),
            content: author.toString(),
            files: [{
                attachment: buffer,
                name: hash + ".zip"
            }]
        });
    }
};
