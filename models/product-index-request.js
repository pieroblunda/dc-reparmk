class ProductIndexRequest {
  constructor({
    userId,
    languageContext,
    offsetRows,
    nextRows,
    supplierCode,
    supplierCodeText,
    categoryCode,
    productCode,
    productName,
    withPrice,
    approvalStatusId
  }) {
    if (userId) {
      this.userId = userId;
    }

    if (languageContext) {
      this.languageContext = languageContext;
    }

    if (offsetRows) {
      this.offsetRows = offsetRows;
    }

    if (nextRows) {
      this.nextRows = nextRows;
    }

    if (supplierCode) {
      this.supplierCode = supplierCode;
    }

    if (supplierCodeText) {
      this.supplierCodeText = supplierCodeText;
    }

    if (categoryCode) {
      this.categoryCode = categoryCode;
    }

    if (productCode) {
      this.productCode = productCode;
    }

    if (productName) {
      this.productName = productName;
    }

    if (withPrice) {
      this.withPrice = withPrice;
    }

    if (approvalStatusId) {
      this.approvalStatusId = approvalStatusId;
    }
  }
}

module.exports = ProductIndexRequest;
