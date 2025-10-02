const sql = require('mssql/msnodesqlv8');
const Mock = require('./mock.server.model.js');
const Utils = require('./utils.server.model.js');

class Products {

    /*
    @param queryParams: Product.normalizeQueryParams(req.query);
    @Output: normalizeResponse object
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
            { field:'NomeCategoria', operator: 'NOT IN', value: ['Categoria', 'NomeCategoria', 'Gruppo Merceologico'] }
        ]
    }
    */
    static async queryAllUsingOriginalKeys_DEPRECATED(queryParams) {
        // return Mock.loadProducts();
        let useCamelCase = false;
        let queryResult = await this.getByQuery(queryParams, useCamelCase);
        const CONDITIONS_STR = this.prepareConditions(queryParams.conditions);
        return this.normalizeResponse(queryResult, queryResult.pageSize, queryResult.pageNumber, CONDITIONS_STR);
    };

    static async getByQuery(queryParams, useCamelCase = true) {

        if(Mock.isActive()) {
            return Mock.loadProducts();
        }

        const pool = await sql.connect(this.connection);
        const PAGE_NUMBER = queryParams.page;
        const PAGINATION_SIZE = queryParams.pageSize;
        const CONDITIONS_STR = this.prepareConditions(queryParams.conditions);
        const queryString = `
        SELECT
        ${this.prepareFields(queryParams.fields)}
        , COUNT(*) OVER() as totalRows
        FROM ReparMk
        WHERE
        DataReport=(SELECT TOP (1) DataReport FROM ReparMk ORDER BY DataReport DESC)
        ${CONDITIONS_STR}
        ORDER BY Articolo
        OFFSET ((${PAGE_NUMBER} - 1) * ${PAGINATION_SIZE}) ROWS
        FETCH NEXT ${PAGINATION_SIZE} ROWS ONLY`;
        const queryResult = await pool.request().query(queryString);
        return this.normalizeResponse(queryResult, PAGINATION_SIZE, PAGE_NUMBER, CONDITIONS_STR, useCamelCase);
    }

    static async queryPriceUpdates() {
        const pool = await sql.connect(this.connection);
        /*
        const PAGE_NUMBER = 1;
        const PAGINATION_SIZE = 0;
        const CONDITIONS_STR = null;
        */
        const dateSince = '2025-08-14';
        const queryString = `
        WITH PreciosConAnterior AS (
            -- step 1: get the last product price for each product
            SELECT
                [Codice Articolo] as productCode,
                DataReport,
                [Prezzo Lis Forn],
                LAG([Prezzo Lis Forn], 1) OVER (PARTITION BY [Codice Articolo] ORDER BY DataReport) AS lastPrice
            FROM
                ReparMk
            WHERE DataReport>'${dateSince}'
        )
        -- step 2: filter in order to show only price differences
        SELECT
            productCode,
            DataReport AS updateDate,
            lastPrice,
            [Prezzo Lis Forn] AS newPrice
        FROM
            PreciosConAnterior
        WHERE
            [Prezzo Lis Forn] <> lastPrice
            AND lastPrice <> 0
        ORDER BY updateDate DESC;`;
        const queryResult = await pool.request().query(queryString);
        return queryResult.recordset;
    }

    static normalizeResponse(response, PAGINATION_SIZE, PAGE_NUMBER, conditionsStr, useCamelCase) {
        let dataArr = response.recordset || response.data;
        let totalRows = dataArr.at(0).totalRows || 0;
        if(useCamelCase) {
            dataArr = Utils.toFriendlyKeys(dataArr);
        }
        return {
            totalRows: totalRows,
            pageSize: PAGINATION_SIZE,
            pageNumber: PAGE_NUMBER,
            dataReport: new Date(response.recordset?.at(0)?.DataReport),
            conditions: this.humanizeConditions(conditionsStr),
            productsIds: response?.recordset?.map( (item) => item['Codice Articolo']),
            data: dataArr
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
            queryObj.conditions = Object.keys(queryObj).map( (fieldName) => {
                let value = queryObj[fieldName];
                let operator;

                // Needs refactoring using switch
                if(value.includes('_')) {
                    operator = value.split('_').at(0);
                    value = value.split('_').at(1);
                    if(operator === 'LIKE') {
                        value = `%${value}%`;
                    } else {
                        value = typeof parseInt(value) === 'number' ? parseInt(value) : value;
                    }

                    return { field:fieldName, operator: operator, value: value };
                } else {
                    return { field:fieldName, operator: '=', value: value };
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

    /**
     * 
     * @param {*} conditionsArr 
     * @returns String
     * @description Transform an array of conditions into a string SQL friendly 
     */
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
            if(item.operator === 'NOT IN') {
                value = `(${value.join(',')})`;
            }
            return `AND ${this.normalizeField(item.field)}${item.operator}${value}`;
        }).join(' ');
    }

    static humanizeConditions(conditionsStr) {
        if(!conditionsStr) {
            conditionsStr = '';
        }
        return conditionsStr.split('AND ').filter( (item) => item!=='');
    }

    static prepareFields(fields) {

        if(!Array.isArray(fields) || fields.at(0) === '*' ) {
            return '*';
        }

        fields.push('dataReport', 'codiceArticolo');

        return fields.filter( (item) => {
            return this.isValidField(item);
        }).map( (item) => {
            return this.normalizeField(item);
        }).join(', ');
    }

    static normalizeField(field) {
        return Utils.camelCaseToColumnName(field);
    }

    static async getProviders(queryParams) {
        const pool = await sql.connect(this.connection);
        
        queryParams.conditions = [
            ...queryParams.conditions,
            { field:'Visibile Catalogo', operator: '=', value: 'Y' },
            { field:'Fornitore', operator: '<>', value: 'NULL' },
            //{ field:'NomeBrand', operator: '=', value: 'DC Casa' } Non esiste ancora
        ];
        const CONDITIONS_STR = this.prepareConditions(queryParams.conditions);
        const queryString = `
        SELECT DISTINCT [Fornitore]
        FROM ReparMk
        WHERE
        DataReport=(SELECT TOP (1) DataReport FROM ReparMk ORDER BY DataReport DESC)
        ${CONDITIONS_STR}
        ORDER BY [Fornitore]`;
        const queryResult = await pool.request().query(queryString);
        const normalizedResponse = this.normalizeResponse(queryResult, 999, 1, CONDITIONS_STR);
        normalizedResponse.data = normalizedResponse.data.map( (item) => item['Fornitore']);
        delete normalizedResponse.productsIds;
        return normalizedResponse;
    }

    static async getCategories(queryParams) {

        if(Mock.isActive()) {
            return Mock.loadCategories();
        }

        const pool = await sql.connect(this.connection);
        queryParams.conditions = [
            ...queryParams.conditions,
            { field:'Visibile Catalogo', operator: '=', value: 'Y' },
            //{ field:'Fornitore', operator: '=', value: 'NULL' }, debe arrivare da parametro
            //{ field:'NomeBrand', operator: '=', value: 'DC Casa' } Non esiste ancora
        ];
        const CONDITIONS_STR = this.prepareConditions(queryParams.conditions);
        const queryString = `
        SELECT DISTINCT [NomeCategoria]
        FROM ReparMk
        WHERE
        DataReport=(SELECT TOP (1) DataReport FROM ReparMk ORDER BY DataReport DESC)
        ${CONDITIONS_STR}
        ORDER BY [NomeCategoria]`;
        const queryResult = await pool.request().query(queryString);
        const normalizedResponse = this.normalizeResponse(queryResult, 999, 1, CONDITIONS_STR);
        normalizedResponse.data = normalizedResponse.data.map( (item) => item['NomeCategoria']);
        delete normalizedResponse.productsIds;
        return normalizedResponse;
    }

    static isValidField(fieldName) {
        return Utils.getFieldsMapping().hasOwnProperty(fieldName);
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