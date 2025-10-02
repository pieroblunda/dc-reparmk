const fs = require('node:fs');

class Mock {
  static isActive(mock) {
    switch (mock) {
      case 'products':
        return Boolean(parseInt(process.env.USE_MOCK_PRODUCTS));
      default:
        return Boolean(parseInt(process.env.USE_MOCK));
    }
  }

  static loadProducts() {
    console.log('Mock /fixtures/mock-products.json');
    return JSON.parse(fs.readFileSync('./fixtures/mock-products.json').toString());
  }

}

module.exports = Mock;
