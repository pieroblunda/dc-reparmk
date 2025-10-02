
class Utils {
  
    static getFieldsMapping() {
        return {
        categoria: '[Categoria]',
        nomeCategoria: '[NomeCategoria]',
        famiglia: '[Famiglia]',
        codGruppo: '[Cod Gruppo]',
        gruppoMerceologico: '[Gruppo Merceologico]',
        azienda: '[Azienda]',
        codiceFornitore: '[Codice Fornitore]',
        fornitore: '[Fornitore]',
        buyer: '[Buyer]',
        tipoFornitore: '[Tipo Fornitore]',
        codiceArticolo: '[Codice Articolo]',
        articolo: '[Articolo]',
        nomeArticoloStraniero: '[Nome Articolo Straniero]',
        barcode: '[Barcode]',
        artForn: '[Art Forn]',
        artSost: '[Art Sost]',
        gestioneALotto: '[Gestione a Lotto]',
        visibileCatalogo: '[Visibile Catalogo]',
        vendIllimitata: '[Vend Illimitata]',
        minAcqForn: '[Min Acq Forn]',
        perioVenRiord: '[Perio_Ven_Riord]',
        minVend: '[Min Vend]',
        minVendImb: '[Min Vend Imb]',
        inner: '[Inner]',
        imballo: '[Imballo]',
        pesoLordoPz: '[Peso Lordo PZ]',
        altezzaCm: '[Altezza cm]',
        larghezzaCm: '[Larghezza cm]',
        profonditaCm: '[Profondità cm]',
        volumeCc: '[Volume cc]',
        pesoCollo: '[Peso Collo]',
        listinoFornitore: '[Listino Fornitore]',
        prezzoLisForn: '[Prezzo Lis Forn]',
        prezzoLs: '[Prezzo LS]',
        offertaStock: '[Offerta/Stock]',
        ricaricoPercentuale: '[Ricarico%]',
        lineaProdotto: '[Linea Prodotto]',
        statoProdotto: '[Stato Prodotto]',
        ultPrAcq: '[Ult Pr Acq]',
        UltDataAcq: '[Ult Data Acq]',
        giacenzaContabile: '[Giacenza Contabile]',
        ordFornitore: '[Ord Fornitore]',
        ordClienti: '[Ord Clienti]',
        disponibilita: '[Disponibilita]',
        vend1MeseCorrente: '[Vend_1°_Mese - CORRENTE]',
        vend2Mese: '[Vend_2°_Mese]',
        vend3Mese: '[Vend_3°_Mese]',
        vend4Mese: '[Vend_4°_Mese]',
        vend5Mese: '[Vend_5°_Mese]',
        vend6Mese: '[Vend_6°_Mese]',
        vend7Mese: '[Vend_7°_Mese]',
        vend8Mese: '[Vend_8°_Mese]',
        vend9Mese: '[Vend_9°_Mese]',
        vend10Mese: '[Vend_10°_Mese]',
        vend11Mese: '[Vend_11°_Mese]',
        vend12Mese: '[Vend_12°_Mese]',
        vend13Mese: '[Vend_13°_Mese]',
        acquisti: '[Acquisti]',
        acq1Mese: '[Acq_1°_Mese - CORRENTE]',
        acq2Mese: '[Acq_2°_Mese]',
        acq3Mese: '[Acq_3°_Mese]',
        acq4Mese: '[Acq_4°_Mese]',
        acq5Mese: '[Acq_5°_Mese]',
        acq6Mese: '[Acq_6°_Mese]',
        acq7Mese: '[Acq_7°_Mese]',
        acq8Mese: '[Acq_8°_Mese]',
        acq9Mese: '[Acq_9°_Mese]',
        acq10Mese: '[Acq_10°_Mese]',
        acq11Mese: '[Acq_11°_Mese]',
        acq12Mese: '[Acq_12°_Mese]',
        acq13Mese: '[Acq_13°_Mese]',
        qtaPicking: '[Qta_Picking]',
        ubicazione: '[Ubicazione]',
        qtaStock: '[Qta_Stock]',
        giacMagazzino: '[Giac_Magazzino]',
        dataReport: '[DataReport]'
        } // return
    } // static getFieldsMapping()

    static camelCaseToColumnName(key) {
        return this.getFieldsMapping()[key];
    }

    static columnNameToCamelCase(value) {
        const object = this.getFieldsMapping();
        return Object.keys(object).find(key => object[key] === value);
    }

    static toFriendlyKeys(arr) {
        let returnedArr = [];
        arr.forEach(item => {
            let objElement = {};
            Object.entries(item).forEach(([key, value]) => {
                let camelCaseKey = this.columnNameToCamelCase(`[${key}]`);
                if(camelCaseKey) {
                    objElement[camelCaseKey] = value;
                }
            });
            returnedArr.push(objElement);
        });
        return returnedArr;
    }

} // Class Utils

module.exports = Utils;
