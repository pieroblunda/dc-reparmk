class baseSwitchApprovalsStateRequest {
    constructor(IdAccount, IdApprovazione, IdStatoApprovazione) {
        this.IdAccount = IdAccount;
        this.IdApprovazione = IdApprovazione;
        this.IdStatoApprovazione = IdStatoApprovazione;
    }
}
module.exports = baseSwitchApprovalsStateRequest;