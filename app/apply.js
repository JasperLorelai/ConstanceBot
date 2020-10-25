module.exports = async (request, response, Client) => {
    const {Util, Config} = Client;
    if (!request.query.code) {
        response.sendFile("/views/redirect-staffapp.html", {root: "."});
        return;
    }
    const user = await Util.discordAPI(request.query.code, Client.webserver + "/apply", Config.urls.discordAPI.users);
    if (user) response.redirect(Config.urls.forms.staffapp + user.id);
    else response.send("Authorisation failed. Contact the owner of the application for help.");
};
