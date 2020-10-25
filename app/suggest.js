module.exports = async (request, response, Client) => {
    const {Util, Config} = Client;
    if (!request.query.code) {
        response.sendFile("/views/redirect-suggest.html", {root: "."});
        return;
    }
    const user = await Util.discordAPI(request.query.code, Client.webserver + "/suggest", Config.urls.discordAPI.users);
    if (user) response.redirect(Config.urls.forms.suggestions + user.id);
    else response.send("Authorisation failed. Contact the owner of the application for help.");
};
