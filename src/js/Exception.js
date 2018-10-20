class SourceInnerExceptionAddedError extends Error {
    constructor (source, innerException, message) {
        super(message);
        this.source = source;
        this.innerException = innerException;
    }
}

class FetchFailedException extends SourceInnerExceptionAddedError {
    constructor (source, innerException, message) {
        if (!message) {
            message = 'Fetch failed.';
        }
        super(source, innerException, message);
    }
}

class FetchResponseAnomalousException extends SourceInnerExceptionAddedError {
    constructor (source, message) {
        if (!message) {
            message = 'Fetch response is anomalous.';
        }
        super(source, null, message);
    }
}

class InvalidOperationException extends SourceInnerExceptionAddedError {
    constructor (source, message) {
        if (!message) {
            message = 'The operation is invalid.';
        }
        super(source, null, message);
    }
}