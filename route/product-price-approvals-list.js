const express = require('express');
const router = require('express').Router();
const bodyParser = require('body-parser');
var productPriceApprovalsListRequest = require('../model/request-product-price-approvals-list');
var switchApprovalsStateRequest = require('../model/request-switch-approvals-state');
var modelResponse = require('../model/response');
const ExcelJS = require('exceljs');
const crud = require('../crud/product-price-approvals-list');
const config = require('../utils/config')
const soap = require('soap');
const fs = require('fs');
const path = require('path');
const sessionUtil = require('../utils/session')
const session = require('express-session');
const nodemailer = require('nodemailer');

router.get('/product-price-approvals-list-script', (req, res) => {
  const filePath = path.resolve(__dirname, '../controller/product-price-approvals-list.js');
  res.sendFile(filePath);
});

router.get('/utility-script', (req, res) => {
  const filePath = path.resolve(__dirname, '../utils/utility.js');
  res.sendFile(filePath);
});

router.get('/product-price-approvals-list/:IdStatoApprovazione', function (req, res) {
  if (sessionUtil.verifyUser(req, res)) {
    res.set('Access-Control-Allow-Origin', '*');

    req.session.user.OffsetRows = 0;
    req.session.save();

    var UserId = req.session.user.Id;
    if (req.session.user.Ruolo == "SUPERVISOR") {
      UserId = null;
    }
    var IdStatoApprovazione = req.params.IdStatoApprovazione;
    if (req.params.IdStatoApprovazione == 0) {
      IdStatoApprovazione = null;
    }
    var myRequest = new productPriceApprovalsListRequest(
      UserId,
      req.session.user.LanguageContext,
      req.session.user.OffsetRows,
      req.session.user.NextRows,
      IdStatoApprovazione
    );
    /* Chiama la crud necessaria per il caricamento dei dati */
    crud.GetProductPriceApprovalsList(myRequest).then(listOf => {
      var data = JSON.parse(JSON.stringify(listOf));
      res.status(200).render('product-price-approvals-list', {
        user: req.session.user,
        approvazioni: JSON.parse(data["resultdata"]),
        RowsCount: JSON.parse(data["rowscount"]),
        IdStatoApprovazione: req.params.IdStatoApprovazione
      });

    }).catch(err => {
      console.log('Errors: ' + err)
      res.status(200).json(new modelResponse('ERR', null, err));
    }).finally(() => {
    })
  }
});

router.post('/product-price-approvals-list/:IdStatoApprovazione', function (req, res) {
  if (sessionUtil.verifyUser(req, res)) {
    res.set('Access-Control-Allow-Origin', '*');

    if (req.session.user.OffsetRows < 0) {
      req.session.user.OffsetRows = 0;
    } else {
      req.session.user.OffsetRows = req.session.user.OffsetRows + req.session.user.NextRows;
    }
    req.session.save();

    var UserId = req.session.user.Id;
    if (req.session.user.Ruolo == "SUPERVISOR") {
      UserId = null;
    }
    var IdStatoApprovazione = req.params.IdStatoApprovazione;
    if (req.params.IdStatoApprovazione == 0) {
      IdStatoApprovazione = null;
    }
    var myRequest = new productPriceApprovalsListRequest(
      UserId,
      req.session.user.LanguageContext,
      req.session.user.OffsetRows,
      req.session.user.NextRows,
      IdStatoApprovazione
    );
    /* Chiama la crud necessaria per il caricamento dei dati */
    crud.GetProductPriceApprovalsList(myRequest).then(listOf => {
      var data = JSON.parse(JSON.stringify(listOf));
      //console.log("data['resultdata']: " + data["resultdata"]);
      res.status(200).json(
        new modelResponse('OK', JSON.parse(data["resultdata"]), null, data["rowscount"], req.session.user)
      );
    }).catch(err => {
      console.log('Errors: ' + err)
      res.status(200).json(new modelResponse('ERR', null, err));
    }).finally(() => {
    })
  }
});

router.put('/switch-approvals-state/:IdApprovazione', function (req, res) {

  return

  if (sessionUtil.verifyUser(req, res)) {
    res.set('Access-Control-Allow-Origin', '*');

    var myRequest = new switchApprovalsStateRequest(
      req.session.user.Id,
      req.params.IdApprovazione,
      req.body.IdStatoApprovazione
    );
    /* Chiama la crud necessaria per il caricamento dei dati */
    crud.PutSwitchApprovalsState(myRequest).then(listOf => {
      res.status(200).json(
        new modelResponse('OK', JSON.parse(listOf), null, 0)
      );
      /* Invia l'e-mail al Supervisor */
      if (req.body.IdStatoApprovazione == 5) {
        const transporter = nodemailer.createTransport({
          host: "smtp-mail.outlook.com",
          port: 587,
          secure: false,
          auth: {
            user: "no-reply@dcgroupitalia.com",
            pass: "Dc.nor.2021",
          },
        });
        async function main() {
          const info = await transporter.sendMail({
            from: "no-reply@dcgroupitalia.com",
            to: req.session.user.Supervisor,
            subject: "App Monitor Rilevamento Prezzi: Richiesta di approvazione",
            html: "Ciao,<br>l&apos;utente " + req.session.user.Nominativo + " ti ha inviato una richiesta di approvazione (ID: <b>" + req.params.IdApprovazione + "</b>)<br><br>Accedi all&apos;app per approvarla,<br>Buon lavoro."
          });
          console.log("E-mail inviata: %s", info.messageId);
        }
        main().catch(console.error);
      }
      /* Invia l'e-mail al Buyer */
      if (req.body.IdStatoApprovazione == 2) {
        const transporter = nodemailer.createTransport({
          host: "smtp-mail.outlook.com",
          port: 587,
          secure: false,
          auth: {
            user: "no-reply@dcgroupitalia.com",
            pass: "Dc.nor.2021",
          },
        });
        async function main() {
          const info = await transporter.sendMail({
            from: "no-reply@dcgroupitalia.com",
            to: req.body.BuyerMail,
            subject: "App Monitor Rilevamento Prezzi: Richiesta di approvazione",
            html: "Ciao,<br>l&apos;utente " + req.session.user.Supervisor + " ha convalidato la richiesta di approvazione (ID: <b>" + req.params.IdApprovazione + "</b>)<br><br>Accedi all&apos;app per visualizzarla,<br>Buon lavoro."
          });
          console.log("E-mail inviata: %s", info.messageId);
        }
        main().catch(console.error);
      }
    }).catch(err => {
      res.status(200).json(new modelResponse('ERR', null, err));
    }).finally(() => {

    });
  }
});

/*
router.post('/download-excel', async (req, res) => {
  async function downloadExcelFillData(data) {

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Anomalie Giacenze');

    worksheet.columns = [
      { header: 'Operatore', key: 'Operatore', width: 20 },
      { header: 'Societ�', key: 'Societa', width: 20 },
      { header: 'Codice Articolo', key: 'CodiceArticolo', width: 15 },
      { header: 'Descrizione', key: 'Denominazione', width: 60 },
      { header: 'Brand', key: 'DescrizioneBrand', width: 20 },
      { header: 'Codice Categoria', key: 'CodiceCategoria', width: 18 },
      { header: 'Categoria', key: 'DescrizioneCategoria', width: 25 },
      { header: 'Codice Fornitore', key: 'CodiceFornitore', width: 20 },
      { header: 'Fornitore', key: 'RagioneSocialeFornitore', width: 35 },
      { header: 'Prezzo Suggerito', key: 'PrezzoSuggerito', width: 16 },
      { header: 'Prezzo Family', key: 'PrezzoFamily', width: 16 },
      { header: 'Prezzo Ilomo', key: 'PrezzoIlomo', width: 16 },
      { header: 'Prezzo Sunlux', key: 'PrezzoSunlux', width: 16 },
      { header: 'Prezzo Papironia', key: 'PrezzoPapironia', width: 16 },
      { header: 'Prezzo Sacchetto Doro', key: 'PrezzoSacchettoDoro', width: 25 },
      { header: 'Prezzo Mp', key: 'PrezzoMp', width: 16 },
      { header: 'Prezzo Eurocom', key: 'PrezzoEurocom', width: 16 },
      { header: 'Prezzo Modo', key: 'PrezzoModo', width: 16 },
      { header: 'Prezzo Wynie', key: 'PrezzoWynie', width: 16 },
      { header: 'Prezzo Em Beauty', key: 'PrezzoEmBeauty', width: 16 },
      { header: 'Prezzo J&E', key: 'PrezzoJ_E', width: 16 },
      { header: 'Prezzo Tertio', key: 'PrezzoTertio', width: 16 },
      { header: 'Percentuale Sconto', key: 'PercentualeSconto', width: 10 },
      { header: 'Prezzo Base Dc Group', key: 'PrezzoListinoBase', width: 20 },
      { header: 'Percentuale Ricarico', key: 'PercentualeRicarico', width: 20 },
      { header: 'Gamma', key: 'Gamma', width: 10 },
      { header: 'Media vendita', key: 'MediaVendita', width: 15 },
      { header: 'Stato', key: 'Stato', width: 15 },
      { header: 'Note', key: 'Note', width: 50 },
    ];
    if (Array.isArray(data)) {
      data.forEach(item => {
        worksheet.addRow(item);
      });
    } else {
      worksheet.addRow(data);
    }
    worksheet.eachRow(function (row, rowNumber) {
      row.eachCell((cell, colNumber) => {
        if (rowNumber == 1) {
          // First set the background of header row
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'd4d0d8' },
          }
          cell.font = {
            bold: true
          }
        }
      })
      //Commit the changed row to the stream
      row.commit();
    });
    var today = new Date();
    today = today.toISOString().slice(0, 10);
    today = today.replace('-', '').replace('-', '');
    res.setHeader('Content-Disposition', 'attachment; filename=' + req.session.user.Nominativo + '_RichiestaApprovazione_' + today + '.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    await workbook.xlsx.write(res);
    res.end();
  }

  function downloadExcelPromise(myLanguageContext, myIdApprovazione) {

    //console.log("myLanguageContext: " + myLanguageContext);
    //console.log("myIdApprovazione: " + myIdApprovazione)

    return new Promise((myResolve, myReject) => {

      // Crea l'istanza del Web Service
      soap.createClient(config.SapWebServiceURL, function (err, client) {
        if (err) {
          console.log(err.message, err.name, err.stack);
          myReject(err.message);
        } else {
          // Invoca il Web Service Method
          client.GetProductPriceApprovalsListExcel({ myLanguageContext, myIdApprovazione }, function (err, result) {
            if (err) {
              //console.log(err.message, err.name, err.stack);
              myReject(err.message);
            } else {

              var response = JSON.parse(JSON.stringify(result));

              //console.log("downloadExcelPromise-result: " + JSON.stringify(result));

              var resultStatus = response.GetProductPriceApprovalsListExcelResult.Status;
              var resultError = response.GetProductPriceApprovalsListExcelResult.Error;
              var resultRowsCount = eval(response.GetProductPriceApprovalsListExcelResult.RowsCount);

              if (resultStatus == "OK") {

                // Inizializza i dati ricevuti dal Web Service
                var resultData = response.GetProductPriceApprovalsListExcelResult.Result.diffgram.Data.Articolo;

                //console.log(response.GetProductPriceApprovalsListExcelResult.RowsCount);

                // Valorizza l'oggetto restituito al route
                myResolve(
                  resultData
                );

              } else {
                myReject(resultError);
              }
            }
          });
        }
      });
    });
  }

  var myLanguageContext = req.session.user.LanguageContext;
  var myIdApprovazione = req.body.IdApprovazione;

  downloadExcelPromise(
    myLanguageContext, myIdApprovazione
  ).then(result => {
    downloadExcelFillData(result);
  }).catch(error => {
    console.log(error);
  });
});*/

module.exports = router;
