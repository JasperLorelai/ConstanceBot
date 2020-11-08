module.exports = {
    name: "eval",
    description: "Evaluates string as code from root script.",
    aliases: ["run"],
    params: ["[code]"],
    perm: "author",
    async execute(Libs, message, args) {
        eval(args.join(" "));
        await message.react("❌");
        const coll = message.createReactionCollector((r, u) => u.id !== message.client.user.id, {time: 10000});
        coll.on("collect", r => {
            if (r.emoji.toString() === "❌") message.deleteBot();
        });
        coll.on("end", () => {
            if (!message.deleted) message.reactions.removeAll();
        });
    }
};
