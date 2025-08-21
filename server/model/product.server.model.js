const sql = require('mssql/msnodesqlv8');
const connection = require('../../config.db.js');

class Products {

    /*
    {
        fields: ['Categoria', 'NomeCategoria', 'Gruppo Merceologico'],
        page: 3,
        pageSize: 25,
        conditions: [
            { field:'Azienda', operator: '=', value: 'DC SRL' },
            { field:'Linea Prodotto', operator: '=', value: 'L01' },
            { field:'Fornitore', operator: 'LIKE', value: '%IMPORT%' },
            { field:'Categoria', operator: '>', value: 70 },
            { field:'Art Sost', operator: '', value: null }
        ]
    }
    */
    static async queryAll(queryParams) {
        const pool = await sql.connect(connection);
        const PAGE_NUMBER = 1;
        const PAGINATION_SIZE = 2;
        const CONDITIONS_STR = this.prepareConditions(queryParams.conditions);
        const queryString = `
        SELECT
        ${this.prepareFields(queryParams.fields)}
        FROM ReparMk
        WHERE
        DataReport=(SELECT TOP (1) DataReport FROM ReparMk ORDER BY DataReport DESC)
        ${CONDITIONS_STR}
        ORDER BY Articolo
        OFFSET ((${PAGE_NUMBER} - 1) * ${PAGINATION_SIZE}) ROWS
        FETCH NEXT ${PAGINATION_SIZE} ROWS ONLY`;
        const queryResult = await pool.request().query(queryString);
        return this.normalizeResponse(queryResult, PAGINATION_SIZE, PAGE_NUMBER, CONDITIONS_STR);
    };

    static normalizeResponse(response, PAGINATION_SIZE, PAGE_NUMBER, conditionsStr) {
        return {
            totalRows: response.rowsAffected,
            pageSize: PAGINATION_SIZE,
            pageNumber: PAGE_NUMBER,
            dataReport: new Date(response.recordset.at(0)),
            conditions: this.humanizeConditions(conditionsStr),
            data: response.recordset
        };
    }

    static normalizeQueryParams(queryParams) {
        return {
            fields: queryParams.fields || ['*'],
            page: parseInt(queryParams.page) || 1,
            pageSize: parseInt(queryParams.pageSize) || 25,
            conditions: queryParams.conditions
        };
    }

    static prepareConditions(conditionsArr) {
        let value;

        if(!Array.isArray(conditionsArr)) {
            return '';
        }

        let visibleInCatalogRule = { field:'Visibile Catalogo', operator: '=', value: 'Y' };
        conditionsArr.push(visibleInCatalogRule);

        return conditionsArr.filter( (item) => {
            return this.isValidField(item.field)
        }).map( (item) => {
            value = (typeof item.value === 'number' || item.value === null) ? item.value : `'${item.value}'`;
            if(item.value === null) {
                value = 'IS NULL';
            }
            return `AND ${this.normalizeField(item.field)}${item.operator}${value}`;
        }).join(' ');
    }

    static humanizeConditions(conditionsStr) {
        return conditionsStr.split('AND ').filter( (item) => item!=='');
    }

    static prepareFields(fields) {
        return fields.filter( (item) => {
            return this.isValidField(item);
        }).map( (item) => {
            return this.normalizeField(item);
        }).join(', ');
    }

    static normalizeField(field) {
        return `[${field}]`;
    }

    static isValidField(fieldName) {
        return [
            '*',
            'Categoria',
            'NomeCategoria',
            'Famiglia',
            'Cod Gruppo',
            'Gruppo Merceologico',
            'Azienda',
            'Codice Fornitore',
            'Fornitore',
            'Buyer',
            'Tipo Fornitore',
            'Codice Articolo',
            'Articolo',
            'Nome Articolo Straniero',
            'Barcode',
            'Art Forn',
            'Art Sost',
            'Gestione a Lotto',
            'Visibile Catalogo',
            'Vend Illimitata',
            'Min Acq Forn',
            'Perio_Ven_Riord',
            'Min Vend',
            'Min Vend Imb',
            'Inner',
            'Imballo',
            'Peso Lordo PZ',
            'Altezza cm',
            'Larghezza cm',
            'Profondità cm',
            'Volume cc',
            'Peso Collo',
            'Listino Fornitore',
            'Prezzo Lis Forn',
            'Prezzo LS',
            'Offerta/Stock',
            'Ricarico%',
            'Linea Prodotto',
            'Stato Prodotto',
            'Ult Pr Acq',
            'Ult Data Acq',
            'Giacenza Contabile',
            'Ord Fornitore',
            'Ord Clienti',
            'Disponibilita',
            'Vend_1°_Mese - CORRENTE',
            'Vend_2°_Mese',
            'Vend_3°_Mese',
            'Vend_4°_Mese',
            'Vend_5°_Mese',
            'Vend_6°_Mese',
            'Vend_7°_Mese',
            'Vend_8°_Mese',
            'Vend_9°_Mese',
            'Vend_10°_Mese',
            'Vend_11°_Mese',
            'Vend_12°_Mese',
            'Vend_13°_Mese',
            'Acquisti',
            'Acq_1°_Mese - CORRENTE',
            'Acq_2°_Mese',
            'Acq_3°_Mese',
            'Acq_4°_Mese',
            'Acq_5°_Mese',
            'Acq_6°_Mese',
            'Acq_7°_Mese',
            'Acq_8°_Mese',
            'Acq_9°_Mese',
            'Acq_10°_Mese',
            'Acq_11°_Mese',
            'Acq_12°_Mese',
            'Acq_13°_Mese',
            'Qta_Picking',
            'Ubicazione',
            'Qta_Stock',
            'Giac_Magazzino',
            'DataReport'
        ].includes(fieldName);
    }

};

module.exports = Products;