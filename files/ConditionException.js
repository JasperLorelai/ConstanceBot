class ConditionException extends Error {

    constructor(message, title, description, color) {
        super();
        this.message = message;
        this.title = title;
        this.description = description;
        this.color = color;
    }

    static throwSafe(message, title, description, color) {
        Promise.reject(new ConditionException(message, title, description, color)).catchError(message);
    }

}

module.exports = ConditionException;
