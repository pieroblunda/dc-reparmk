const Fs = require('fs');

const data = Fs.readFileSync(`${process.cwd()}/scripts/data-massive-import.csv`, { encoding: 'utf8'});

const queryTemplate = `UPDATE [price_tracking_monitor].[dbo].[competitor_product] SET price=___PRICE___, note='___NOTE___' WHERE [price_tracking_monitor].[dbo].[competitor_product].id=(SELECT TOP (1) [price_tracking_monitor].[dbo].[competitor_product].id FROM [price_tracking_monitor].[dbo].[competitor_product] LEFT JOIN [price_tracking_monitor].[dbo].[products] ON product_id=[price_tracking_monitor].[dbo].[products].id WHERE code='___PRODUCTCODE___' AND competitor_id=___COMPETITORID___)`;

let queryBag = [];

data.split('\n').map( (line) => {
    let lineParsed = line.split(';')
    return {
        productId: lineParsed[0],
        price: lineParsed[3].replace(',', '.'),
        note: lineParsed[4],
        competitorId: lineParsed[5].replace('\r','').replace('\n','')
    };
}).forEach( (item) => {
    //console.log(item.productId, item.price, item.note, item.competitorId);
    let q = queryTemplate
            .replace('___PRICE___', item.price)
            .replace('___PRODUCTCODE___', item.productId)
            .replace('___COMPETITORID___', item.competitorId)
            .replace('___NOTE___', item.note);
    queryBag.push(q);
});

const dataToWrite = queryBag.join('\n');

Fs.writeFile(`${process.cwd()}/scripts/output-massive-import.sql`, dataToWrite, 'utf8', (err) => {
  if (err) {
    console.error('Error writing file:', err);
    return;
  }
  console.log('File written successfully!');
});