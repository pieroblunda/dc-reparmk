let Fs = require('node:fs');

class Mock {

    static isActive() {
        return Boolean(parseInt(process.env.USE_MOCK));
    }
    
    static loadLoginResponse() {
        console.log('Mock /fixtures/user-mock-buyer.json');
        return JSON.parse(Fs.readFileSync('./fixtures/user-mock-buyer.json').toString());
    }

    static loadProductGetArticoliResponse() {
        console.log('Mock /fixtures/articles-list-all-mock.json');
        return JSON.parse(Fs.readFileSync('./fixtures/articles-list-all-mock.json').toString());
    }

    static loadProductGetArticoliByIdResponse() {
        console.log('Mock /fixtures/article-by-id-mock.json');
        return JSON.parse(Fs.readFileSync('./fixtures/article-by-id-mock.json').toString());
    }

    static loadProductGetBuyerResponse() {
        console.log('Mock /fixtures/buyer-all-mock.json');
        return Fs.readFileSync('./fixtures/buyer-all-mock.json').toString();
    }

    static loadProductGetFornitoriResponse() {
        console.log('Mock /fixtures/buyer-all-mock.json');
        return Fs.readFileSync('./fixtures/fornitore-all-mock.json').toString();
    }

    static loadGetDetectPriceHistoryResponse() {
        console.log('Mock fixtures/article-history-mock.json');
        return Fs.readFileSync('./fixtures/article-history-mock.json').toString();
    }

    


}

module.exports = Mock;