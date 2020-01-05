module.exports = {
    name: "eval",
    description: "Evaluates string as code from root script.",
    aliases: ["run"],
    params: ["[code]"],
    perm: "author",
    async execute(message, args) {
        const {client, reactions, deleted} = message;
        // noinspection JSUnusedLocalSymbols
        const {config, keyv} = client;
        eval(args.join(" "));
        await message.react("❌");
        const coll = message.createReactionCollector((r, u) => u.id !== client.user.id, {time: 10000});
        coll.on("collect", r => {
            if (r.emoji.toString() === "❌") message.delete();
        });
        coll.on("end", () => {
            if (!deleted) reactions.removeAll();
        });
    }
};