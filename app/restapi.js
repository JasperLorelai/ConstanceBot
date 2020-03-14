module.exports = async (request, response) => {
    for(let [key] of Object.entries(request.query)) {
        if(key === "getWebhook") response.send(process.env.WEBHOOK_REDIRECT);
    }
};
