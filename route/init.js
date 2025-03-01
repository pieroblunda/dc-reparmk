const express = require('express');
const config = require('../utils/config')
const init = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sessionUtil = require('../utils/session')
const session = require('express-session');


init.post('/init', function (req, res) {

    /* Imposta il language dell'APP */
    var languageContext = config.LanguageContext;

    /* Valorizza l'oggetto session dell'APP */

    const user = {
        Id: req.session.user.Id,
        Username: req.session.user.Username,
        Nominativo: req.session.user.Nominativo,
        Ruolo: req.session.user.Ruolo,
        Codice: req.session.user.Codice,
        LanguageContext: req.session.user.LanguageContext,
        OffsetRows: -9,
        NextRows: req.session.user.NextRows

    };

    req.session.user = JSON.parse(
        JSON.stringify(user)
    );
    req.session.save();
    res.status(200).send("OK");
});

module.exports = init;
