module.exports = (request, response) => {
    response.sendFile("/views/redirect-changeloggen.html", {root: "."});
};
