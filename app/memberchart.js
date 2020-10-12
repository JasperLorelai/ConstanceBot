module.exports = async (request, response) => {
    response.sendFile("/views/memberchart/index.html", {root: "."});
};
