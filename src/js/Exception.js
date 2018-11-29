class SourceInnerExceptionAddedError extends Error {
    constructor (innerException, message) {
        super(message);
        this.innerException = innerException;
    }
}

class FetchFailedException extends SourceInnerExceptionAddedError {
    constructor (innerException, message) {
        if (!message) {
            message = 'Fetch failed.';
        }
        super(source, innerException, message);
    }
}

class FetchResponseAnomalousException extends SourceInnerExceptionAddedError {
    constructor (message) {
        if (!message) {
            message = 'Fetch response is anomalous.';
        }
        super(source, null, message);
    }
}

class InvalidOperationException extends SourceInnerExceptionAddedError {
    constructor (message) {
        if (!message) {
            message = 'The operation is invalid.';
        }
        super(source, null, message);
    }
}