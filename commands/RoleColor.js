module.exports = {
    name: "rolecolor",
    description: "Change the color of a guild role. The color format can be hex, 'rgb(r,g,b)' or 'hsl(h,s,l)'.",
    aliases: ["rcolor"],
    params: ["[role]", "[color]"],
    guildOnly: true,
    perm: "admin",
    async execute(Libs, message, args) {
        const {Util, Canvas, fetch, ConditionException} = Libs;
        const {guild, channel, author} = message;

        const role = Util.findRole(args.shift(), guild);
        if (!role) throw new ConditionException(author, "Role Color", "Role not found!");
        let color = args.join("").replace(/\s/g, "").getColorFromString();
        if (!color) throw new ConditionException(author, "Role Color", "Invalid color! The only color types supported are: `keyword`, `hex` (starts with #), `rgb(r, g, b)` and `hsl(h, s, l)`.");
        const canvasImage = Canvas.createCanvas(380, 84);
        const ctx = canvasImage.getContext("2d");
        ctx.fillStyle = "#36393F";
        const {width, height} = canvasImage;
        ctx.fillRect(0, 0, width, height);
        ctx.font = "15px Verdana";
        ctx.fillStyle = "#" + color;
        const name = author.username;
        ctx.fillText(name, width * .21, height * .44);
        ctx.font = "11px Verdana";
        ctx.fillStyle = "#686f77";
        const date = new Date();
        ctx.fillText("Today at " + date.getHours() + ":" + date.getMinutes(), width * .275 + Util.getTextWidth(name, "11px Verdana"), height * .44);
        ctx.font = "14px Verdana";
        ctx.fillStyle = "#adadad";
        ctx.fillText("I am a beautiful butterfly!", width * .21, height * .65);
        ctx.beginPath();
        ctx.arc(width * .1, height * .5, 20, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        const image = await fetch.default(author.displayAvatarURL({format: "png"}) + "?size=40").then(y => y.buffer());
        ctx.drawImage(await Canvas.loadImage(image), width * .05, height * .25);
        channel.send(author.toString(), Util.embed("Role Color").setImagePermanent(canvasImage.toBuffer())).then(async msg => {
            await Util.handleChange(msg, author, role, null, role => role.setColor(color), {denied: "", accepted: "Role color updated!", newTitle: "Role Color Preview"});
        });
    }
};
