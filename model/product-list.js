class RequestProductList {
    constructor(IdAccount, LanguageContext, OffsetRows, NextRows, CodiceArticolo) {
        this.IdAccount = IdAccount;
        this.LanguageContext = LanguageContext;
        this.OffsetRows = OffsetRows;
        this.NextRows = NextRows;
        this.CodiceArticolo = CodiceArticolo;
    }
}
module.exports = RequestProductList;