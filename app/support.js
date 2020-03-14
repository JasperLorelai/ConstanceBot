module.exports = async (request, response, client) => {
    const {util, config} = client;
    if(!request.query.code) {
        response.sendFile("/views/redirect-support.html", {root: "."});
        return;
    }
    console.log(client.webserver + "/" + __filename);
    const user = await util.discordAPI(request.query.code, client.webserver + "/" + __filename, config.discordapi.users);
    response.redirect(config.app.forms.supportticket + user.id);
};
