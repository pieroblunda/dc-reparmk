class baseSwitchProductApprovalsStateRequest {
    constructor(IdAccount, IdApprovazioneArticolo, IdStatoApprovazione) {
        this.IdAccount = IdAccount;
        this.IdApprovazioneArticolo = IdApprovazioneArticolo;
        this.IdStatoApprovazione = IdStatoApprovazione;
    }
}
module.exports = baseSwitchProductApprovalsStateRequest;