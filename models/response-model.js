class ResponseModel {
  constructor(status, data, error, rowscount, user) {
    this.status = status;
    this.data = data;
    this.error = error;
    this.rowscount = rowscount;
    this.user = user
  }
}

module.exports = ResponseModel;
