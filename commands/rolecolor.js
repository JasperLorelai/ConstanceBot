// noinspection JSUnusedLocalSymbols
module.exports = {
    name: "rolecolor",
    description: "Change the color of a guild role. The color format can be hex, 'rgb(r,g,b)' or 'hsl(h,s,l)'.",
    aliases: ["rcolor"],
    params: ["[role]", "[color]"],
    guildOnly: true,
    perm: "admin",
    async execute(message, args) {
        const Client = message.client;
        const {guild, channel, author} = message;
        const {Config, Util, canvas} = Client;
        try {
            const role = Util.findRole(args.shift(), guild);
            if (!role) {
                await channel.send(author.toString(), Util.embed("Role Color", "Role not found!", Config.color.red));
                return null;
            }
            let color = Util.getColorFromString(args.join("").replace(/\s/g, ""));
            if (!color) {
                await channel.send(author.toString(), Util.embed("Role Color", "Invalid color! The only color types supported are: `keyword`, `hex` (starts with #), `rgb(r, g, b)` and `hsl(h, s, l)`.", Config.color.red));
                return null;
            }
            // noinspection JSUnresolvedFunction
            const canvasImage = canvas.createCanvas(380, 84);
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
            const image = await Client.fetch.default(author.displayAvatarURL({format: "png"}) + "?size=40").then(y => y.buffer());
            // noinspection JSUnresolvedFunction
            ctx.drawImage(await canvas.loadImage(image), width * .05, height * .25);
            channel.send(author.toString(), Util.embed("Role Color").attachFiles([{
                attachment: canvasImage.toBuffer(), name: "bg.png"
            }]).setImage("attachment://bg.png")).then(async msg => {
                await Util.handleChange(msg, author, role, null, role => role.setColor(color), {denied: "", accepted: "Role color updated!", newTitle: "Role Color Preview"});
            });
        }
        catch (e) {
            await Util.handleError(message, e);
        }
    }
};
