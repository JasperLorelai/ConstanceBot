module.exports = (request, response) => {
    response.sendFile("/views/redirect-discord.html", {root: "."});
};
