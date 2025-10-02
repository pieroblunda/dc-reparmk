const Product = require('../model/product.server.model.js');

module.exports = {

    queryAllUsingOriginalKeys_DEPRECATED: async function(req, res) {
        try {
            res.set('Access-Control-Allow-Origin', '*');
            let params = Product.normalizeQueryParams(req.query);
            const result = await Product.queryAllUsingOriginalKeys_DEPRECATED(params, false);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(500).json({error: true});
        }
    },

    getByQuery: async function(req, res) {
        try {
            res.set('Access-Control-Allow-Origin', '*');
            let params = Product.normalizeQueryParams(req.query);
            const result = await Product.getByQuery(params);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(500).json({error: true});
        }
    },

    queryPriceUpdates: async function(req, res) {
        try {
            res.set('Access-Control-Allow-Origin', '*');
            const result = await Product.queryPriceUpdates();
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(500).json({error: true});
        }
    },

    getProviders: async function(req, res) {
        try {
            res.set('Access-Control-Allow-Origin', '*');
            let params = Product.normalizeQueryParams(req.query);
            const result = await Product.getProviders(params);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(500).json({error: true});
        }
    },

    getCategories: async function(req, res) {
        try {
            res.set('Access-Control-Allow-Origin', '*');
            let params = Product.normalizeQueryParams(req.query);
            const result = await Product.getCategories(params);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(500).json({error: true});
        }
    }

};