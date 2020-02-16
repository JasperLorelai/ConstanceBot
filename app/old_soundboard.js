module.exports = (request, response) => {
    response.sendFile("/views/soundboard.html", {root: "."});
};