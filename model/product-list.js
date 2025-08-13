class RequestProductList {
  constructor(IdAccount, LanguageContext, OffsetRows, NextRows, CodiceArticolo, RequestBody) {
    this.IdAccount = IdAccount;
    this.LanguageContext = LanguageContext;
    this.OffsetRows = OffsetRows;
    this.NextRows = NextRows;
    this.CodiceArticolo = CodiceArticolo;
    this.RequestBody = RequestBody;
  }
}

module.exports = RequestProductList;
