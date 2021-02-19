module.exports = {
    name: "info",
    description: "Display MHAP info.",
    guildOnly: true,
    guildWhitelist: ["mhap"],
    async execute(Libs, message) {
        const {author} = message;
        const {Config, Util} = Libs;
        const {info} = Config.guildData.mhap;
        await message.channel.send(author.toString(), Util.embed("MHAP Information").addFields(info.getInfo(), info.getForms()));
    }
};
