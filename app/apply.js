module.exports = async (request, response, client) => {
    const {util, config} = client;
    if (!request.query.code) {
        response.sendFile("/views/redirect-staffapp.html", {root: "."});
        return;
    }
    const user = await util.discordAPI(request.query.code, client.webserver + "/apply", config.urls.discordAPI.users);
    if (user) response.redirect(config.urls.forms.staffapp + user.id);
    else response.send("Authorisation failed. Contact the owner of the application for help.");
};
