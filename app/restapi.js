module.exports = async (request, response, Client) => {
    const {keyv, Util, Config} = Client;
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
                response.send(value ? Util.getKeyByValue(db, value) : "");
                break;
            case "getMCUsers":
                response.send(await keyv.get("minecraft") || {});
                break;
            case "putMCChannel":
                response.end();
                if (!value) return;
                Client.minecraft = value;
                break;
            case "getMemberChart":
                const gist = Config.urls.github + "gists/" + Client.memberCount;
                const body = await Client.fetch(gist, {headers: {Accept: "application/vnd.github.v3+json"}}).then(y => y.json());
                let data;
                try {
                    const files = body.files;
                    const fileNames = Object.keys(files);
                    const firstFile = body.files[fileNames[0]];
                    data = await Client.fetch(firstFile["raw_url"]).then(y => y.json());
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
