module.exports = (request, response) => {
    response.sendFile("/views/soundboard/index.html", {root: "."});
};
