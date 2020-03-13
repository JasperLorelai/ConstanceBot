module.exports = (request, response) => {
    response.sendFile("/views/london/main/index.html", {root: "."});
};