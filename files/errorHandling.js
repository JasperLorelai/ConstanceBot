const {fetch, Discord, Config} = require("../Libs");
const {MessageEmbed} = Discord;

async function handle(error, code = 0) {
    setTimeout(() => process.exit(code), 1000);

    // Send msg to webhook log.
    if (!(error instanceof Error)) return;
    const embed = new MessageEmbed()
        .setTitle(error.message)
        .setDescription(">>> " + error.stack)
        .setColor(Config.color.red)
        .toJSON();
    await fetch(process.env.WEBHOOK_ERROR, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({embeds: [embed]})
    });
}

process.on("uncaughtException", async error => await handle(error, 1));
process.on("unhandledRejection", async error => await handle(error,1));
process.on("SIGTERM", async () => await handle());
process.on("SIGINT", async () => await handle());
