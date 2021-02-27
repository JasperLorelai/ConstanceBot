const {fetch, Util, Config} = require("../Libs");
const Client = require("../Client");

function handle(error, code = 0) {
    if (error && error instanceof Error) {
        const embedObject = Util.embed(error.message, ">>> " + error.stack, Config.color.red).toJSON();
        fetch(process.env.WEBHOOK_ERROR, {
            method: "POST",
            contentType: "application/json",
            payload: JSON.stringify({embeds: [embedObject]})
        });
    }

    setTimeout(() => {
        Client.destroy();
        process.exit(code);
    }, 500);
}

process.on("uncaughtException", error => handle(error, 1));
process.on("unhandledRejection", error => handle(error,1));
process.on("SIGTERM", handle);
process.on("SIGINT", handle);
