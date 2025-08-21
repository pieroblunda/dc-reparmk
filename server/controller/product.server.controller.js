const Product = require('../model/product.server.model.js');

module.exports = async function queryAll(req, res) {
    try {
        res.set('Access-Control-Allow-Origin', '*');

        let queryParams = Product.normalizeQueryParams({
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
        });
        const result = await Product.queryAll(queryParams);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: true});
    }
}