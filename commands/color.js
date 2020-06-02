module.exports = {
    name: "color",
    description: "Takes a color from any format and displays it in multiple other formats.",
    params: ["[color]"],
    async execute(message, args) {
        const {channel, author, client} = message;
        const {config, util, colorConvert} = client;
        try {
            const color = args.join("");
            let finalColor = util.getColorFromString(color);

            if (!finalColor) {
                await channel.send(author.toString(), util.embed("Colors", "Invalid color! The only color types supported are: `keyword`, `hex` (starts with #), `rgb(r, g, b)` and `hsl(h, s, l)`.", config.color.red));
                return null;
            }

            const keyword = colorConvert.hex.keyword(finalColor);
            const rgb = colorConvert.hex.rgb(finalColor).map(h => (h / 255 * 100).toFixed(1) + "%").join(", ");
            const [h, s, l] = colorConvert.hex.hsl(finalColor);
            const hsl = h + "°, " + s + "%, " + l + "%";

            const canvas = client.canvas.createCanvas(200, 200);
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#" + finalColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            channel.send(author.toString(), util.embed("Colors",
                (keyword ? "\n**Keyword:** " + keyword.toFormalCase() : "") +
                "\n**Hex:** `" + finalColor + "`" +
                "\n**RGB:** `" + rgb + "`" +
                "\n**HSL:** `" + hsl + "`"
            ).attachFiles([{
                attachment: canvas.toBuffer(), name: "bg.png"
            }]).setImage("attachment://bg.png"));
        }
        catch(e) {
            await util.handleError(message, e);
        }
    }
};
