'use strict';

/*
|--------------------------------------------------------------------------
| NODE MODULES
|--------------------------------------------------------------------------
*/

const fs = require('fs');
const path = require('path');
const sql = require('mssql/msnodesqlv8');
const ExcelJS = require('exceljs');
const nodemailer = require('nodemailer');

/*
|--------------------------------------------------------------------------
| CUSTOM MODULES
|--------------------------------------------------------------------------
*/

const ResponseModel = require('../models/response-model');
const connection = require('../config.db');
const config = require('../utils/config')

/*
|--------------------------------------------------------------------------
| UTILS
|--------------------------------------------------------------------------
*/

const fillWorksheet = async (worksheet, columns, rows) => {
  worksheet.columns = columns;

  if (Array.isArray(rows)) {
    rows.forEach(item => worksheet.addRow(item));
  } else {
    worksheet.addRow(rows);
  }

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber == 1) {
      row.eachCell((cell, colNumber) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'd4d0d8' },
        };

        cell.font = { bold: true };
      });
    }

    row.commit();
  });

  return worksheet;
};


/*
|--------------------------------------------------------------------------
| MODULE EXPORTS
|--------------------------------------------------------------------------
*/

const downloadExcel = async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  let worksheet = workbook.addWorksheet('Anomalie Giacenze');

  const columns = [
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

  worksheet = await fillWorksheet(worksheet, columns, []);

  let today = new Date();
  today = today.toISOString().slice(0, 10);
  today = today.replace('-', '').replace('-', '');

  res.setHeader('Content-Disposition', 'attachment; filename=new_RichiestaApprovazione_' + today + '.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  await workbook.xlsx.write(res);
  res.end();
};

module.exports = { downloadExcel };
