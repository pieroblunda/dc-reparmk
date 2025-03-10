class baseRequest {
    constructor(IdAccount, LanguageContext, OffsetRows, NextRows, CodiceFornitore, CodiceArticolo, IdApprovazione) {
        this.IdAccount = IdAccount;
        this.LanguageContext = LanguageContext;
        this.OffsetRows = OffsetRows;
        this.NextRows = NextRows;
        this.CodiceFornitore = CodiceFornitore;
        this.CodiceArticolo = CodiceArticolo;
        this.IdApprovazione = IdApprovazione;
    }
}
module.exports = baseRequest;