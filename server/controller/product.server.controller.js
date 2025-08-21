const Product = require('../model/product.server.model.js');

module.exports = async function queryAll(req, res) {
    try {
        res.set('Access-Control-Allow-Origin', '*');
        let params = Product.normalizeQueryParams(req.query);
        const result = await Product.queryAll(params);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: true});
    }
}