module.exports = {
    name: "eval",
    description: "Evaluates string as code from root script.",
    aliases: ["run"],
    params: ["[code]"],
    perm: "author",
    async execute(message, args) {
        const Client = message.client;
        const {Util} = Client;
        try {
            eval(args.join(" "));
            await message.react("❌");
            const coll = message.createReactionCollector((r, u) => u.id !== Client.user.id, {time: 10000});
            coll.on("collect", r => {
                if (r.emoji.toString() === "❌") message.delete({reason: "botIntent"});
            });
            coll.on("end", () => {
                if (!message.deleted) message.reactions.removeAll();
            });
        }
        catch (e) {
            await Util.handleError(message, e);
        }
    }
};
