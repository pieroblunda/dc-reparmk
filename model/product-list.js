class RequestProductList {
    constructor(IdAccount, LanguageContext, OffsetRows, NextRows) {
        this.IdAccount = IdAccount;
        this.LanguageContext = LanguageContext;
        this.OffsetRows = OffsetRows;
        this.NextRows = NextRows;
    }
}
module.exports = baseRequest;