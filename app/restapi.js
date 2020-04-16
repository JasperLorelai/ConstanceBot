module.exports = async (request, response, client) => {
    const {keyv, util} = client;
    for (let [key, value] of Object.entries(request.query)) {
        switch (key) {
            case "getWebhook":
                response.send(process.env.WEBHOOK_REDIRECT);
                break;
            case "getMCUser":
                if (value) {
                    let db = await keyv.get("minecraft") || {};
                    response.send(db[value] || "");
                }
                else response.end();
                break;
            case "getMCUserID":
                let db = await keyv.get("minecraft") || {};
                response.send(value ? util.getKeyByValue(db, value) : "");
                break;
            case "getMCUsers":
                response.send(await keyv.get("minecraft") || {});
                break;
            case "putMCChannel":
                response.end();
                if (!value) return;
                client.minecraft = value;
                break;
        }
    }
};
