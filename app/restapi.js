module.exports = async (request, response, client) => {
    const {keyv, util, config} = client;
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
            case "getMemberChart":
                const gist = config.urls.github + "gists/" + process.env.MEMBER_TRAFFIC;
                const body = await client.fetch(gist, {headers: {Accept: "application/vnd.github.v3+json"}}).then(y => y.json());
                let data;
                try {
                    data = JSON.parse(body.files["memberTrafficData.json"].content);
                }
                catch (e) {
                    response.json({});
                    return;
                }
                response.json(data);
                break;
        }
    }
};
