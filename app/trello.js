module.exports = (request, response) => {
    response.sendFile("/views/redirect-trello.html", {root: "."});
};