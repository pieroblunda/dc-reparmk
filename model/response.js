class response {
    constructor(status, data, error, rowscount) {
        this.status = status;
        this.data = data;
        this.error = error;
        this.rowscount = rowscount;
    }
}

module.exports = response;