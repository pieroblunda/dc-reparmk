'use strict';

class RequestModel {
  constructor(IdAccount, LanguageContext, OffsetRows, NextRows, CodiceFornitore, CodiceArticolo, IdStatoApprovazioneArticolo) {
    this.IdAccount = IdAccount;
    this.LanguageContext = LanguageContext;
    this.OffsetRows = OffsetRows;
    this.NextRows = NextRows;
    this.CodiceFornitore = CodiceFornitore;
    this.CodiceArticolo = CodiceArticolo;
    this.IdStatoApprovazioneArticolo = IdStatoApprovazioneArticolo;
  }
}

module.exports = RequestModel;
