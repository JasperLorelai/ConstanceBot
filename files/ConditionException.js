class ConditionException extends Error {
    constructor(author, title, description, color) {
        super();
        this.author = author;
        this.title = title;
        this.description = description;
        this.color = color;
    }

    static throwSafe(channel, author, title, description, color) {
        Promise.reject(new ConditionException(author, title, description, color)).catchError(channel);
    }
}

module.exports = ConditionException;
