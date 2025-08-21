const sql = require('mssql/msnodesqlv8');

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
        const pool = await sql.connect(this.connection);
        const PAGE_NUMBER = queryParams.page;
        const PAGINATION_SIZE = queryParams.pageSize;
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
            totalRows: response.rowsAffected.at(0),
            pageSize: PAGINATION_SIZE,
            pageNumber: PAGE_NUMBER,
            dataReport: new Date(response.recordset.at(0)?.DataReport),
            conditions: this.humanizeConditions(conditionsStr),
            productsIds: response.recordset.map( (item) => item['Codice Articolo']),
            data: response.recordset
        };
    }

    static getQueryParamsObjectFromQueryString(queryObj) {
        const fixedParams = ['fields', 'page', 'pageSize'];
        const conditions = Object.keys(queryObj).filter( (item) => !fixedParams.includes(item));

        let returnedObject = {
            fields: queryObj.fields.split(','),
            page: queryObj.page,
            pageSize: queryObj.pageSize,
            conditions: conditions.map( (item) => {
                let key = item;
                let value = queryObj[item];

                if(value.includes('_')) {
                    return { field:item, operator: value.split('_').at(0), value: value.split('_').at(1) };
                } else {
                    return { field:item, operator: '=', value: value };
                }
            })
        };
        return this.normalizeQueryParams(returnedObject);
    }

    static normalizeQueryParams(queryObj) {

        if (typeof queryObj.fields === 'string') {
            queryObj.fields = queryObj.fields.split(',')
        }

        if (!Object.hasOwnProperty('conditions')) {
            queryObj.conditions = Object.keys(queryObj).map( (item) => {
                let key = item;
                let value = queryObj[item];
                let operator;


                if(value.includes('_')) {
                    operator = value.split('_').at(0);
                    value = value.split('_').at(1);
                    if(operator === 'LIKE') {
                        value = `%${value}%`;
                    } else {
                        value = typeof parseInt(value) === 'number' ? parseInt(value) : value;
                    }

                    return { field:item, operator: operator, value: value };
                } else {
                    return { field:item, operator: '=', value: value };
                }
            });
        }

        return {
            fields: queryObj.fields || ['*'],
            page: parseInt(queryObj.page) || 1,
            pageSize: parseInt(queryObj.pageSize) || 25,
            conditions: queryObj.conditions
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
            if(item.value === null || item.value === 'null') {
                value = 'IS NULL';
            }
            return `AND ${this.normalizeField(item.field)}${item.operator}${value}`;
        }).join(' ');
    }

    static humanizeConditions(conditionsStr) {
        return conditionsStr.split('AND ').filter( (item) => item!=='');
    }

    static prepareFields(fields) {

        if(!Array.isArray(fields)) {
            return '*';
        }

        fields.push('DataReport', 'Codice Articolo');

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

    static get connection() {
        return {
            server   : process.env.DB_SERVER,
            port     : parseInt(process.env.DB_PORT),
            database : process.env.DB_NAME,
            user     : process.env.DB_USER,
            password : process.env.DB_PASSWORD,
            options: {
                //trustedConnection: true, // Set to true if using Windows Authentication
                trustServerCertificate: true, // Set to true if using self-signed certificates
            },
            /*   driver: 'msnodesqlv8', */ // Required if using Windows Authentication
        }
    }

};

module.exports = Products;