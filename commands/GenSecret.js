module.exports = {
    name: "gensecret",
    description: "Generate a secret from a string.",
    params: ["[string]"],
    perm: "author",
    hide: true,
    async execute(Libs, message, args) {
        const {Util, md5} = Libs;

        try {
            const md5 = md5(args.join(" "));
            // Dashify
            const uuidFormat = md5.replace(/([a-zA-Z0-9]{8})([a-zA-Z0-9]{4})([a-zA-Z0-9]{4})([a-zA-Z0-9]{4})([a-zA-Z0-9]+)/, "$1-$2-$3-$4-$5");
            // Change cases for last dash
            const secret = uuidFormat.substr(0, 24).toLowerCase() + uuidFormat.substr(24).toUpperCase();
            await message.channel.send(Util.embed("Secret Generator", "**Generated:** `" + secret + "`"));
        }
        catch (e) {
            await Util.handleError(message, e);
        }
    }
};
