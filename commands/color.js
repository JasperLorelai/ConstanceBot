module.exports = {
    name: "color",
    description: "Takes a color from any format and displays it in multiple other formats.",
    params: ["[color]"],
    async execute(message, args) {
        const {channel, author, client} = message;
        const {config} = client;
        let hex = config.colorToHex(args.join("").replace(/\s/g, ""));
        if(!hex) {
            await channel.send(author.toString(), config.embed("Colors", "Invalid color! The only color types supported are hex, 'rgb(r,g,b)' and 'hsl(h,s,l)'.", config.color.red));
            return null;
        }

        const rgb = config.hexToRGB(hex).map(h => (h / 255 * 100).toFixed(1) + "%").join(", ");
        const [h, s, l] = config.hexToHSL(hex);
        const hsl = h + "°, " + s + "%, " + l + "%";

        const canvas = client.canvas.createCanvas(200, 200);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#" + hex;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        channel.send(author.toString(), config.embed("Colors", "**Hex:** " + hex + "\n**RGB:** " + rgb + "\n**HSL:** " + hsl).attachFiles([{
            attachment: canvas.toBuffer(), name: "bg.png"
        }]).setImage("attachment://bg.png"));
    }
};