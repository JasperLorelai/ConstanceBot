module.exports = async (request, response, client) => {
    for(let [key, value] of Object.entries(request.query)) {
        if (key === "getWebhook") response.send(process.env.WEBHOOK_REDIRECT);
        if (key === "getMCUser") {
            if (!value) {
                response.end();
                return;
            }
            let db = await client.keyv.get("minecraft");
            response.send((db && db[value]) ? db[value].replace(/-/g, "") : "");
        }
    }
};
