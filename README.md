# API ReparMk

Esto se va a usar como paquete NPM o como una URL para llamar ?

## Table of content

* Base URL
* Available query Params
* API GET getByQuery
* API GET getProviders
* API GET getCategories
* API GET queryPriceUpdates
* API GET queryAllUsingOriginalKeys (DEPRECATED)
* Using Mocks

## Base URL

> http://localhost:3000

## Available query Params

In order to match a different set, or customize output, it is possible to use a queryParams.

| paramKey | Value | Default | Description |
|---|---|---|---|
| fields | csv string| `[*]` | List of attributes to query separated by values using camelCase style |
| page | Integer | 1 |Number starting from 1 corrisponding to the page to query |
| pageSize | Integer | 25 | Number of elements per page to be present in the query result |ù
| exclude | String | List of exclude values as CSV |
| [any_attribute_key] | String | _Empty value_ | Any key attribute in camelCase to use as filter |

> [IMPORTANT]
> Any query attribute different of 'fields', 'page' or 'pageSize' will be considered a filter. It must to match of any of the valid keyAttributes.

**About fields**

> Available fields are any of reparMK. See the complete list

> NOTE: field is case sensitive.

> Note: '*' is a valid field to get all available fields
> IMPORTANT: System will automatically adds `dataReport` and `codiceArticolo`  field in order to show how old is the information showed in UI.

**About conditions**
An array of object where each item match the  following schema:

```javascript
{ field:'Visibile Catalogo', operator: '=', value: 'Y' }
```
> IMPORTANT: System automatically will add the rule used as example above in order to query only active products

**Operators**

It is possible to match products using a criteria with the operators `=`, `<`, `>`, `LIKE` AND `IS`.

| Operator | Syntax | Example |
|---|---|---|
| `=` | ?codiceFornitore=F005229 | [View](http://localhost:3000/getByQuery?fields=codGruppo,categoria,nomeCategoria,codiceFornitore&page=1&pageSize=2&codiceFornitore=F005229) |
| `>` | ?perioVenRiord=>_60 | [View](http://localhost:3000/getByQuery?fields=codGruppo,categoria,nomeCategoria,perioVenRiord&page=1&pageSize=2&perioVenRiord=%3E_60) |
| `<` | ?perioVenRiord=<_61 | [View](http://localhost:3000/getByQuery?fields=codGruppo,categoria,nomeCategoria,perioVenRiord&page=1&pageSize=2&perioVenRiord=%3C_60) |
| `LIKE` | ?azienda=LIKE_SRL | [View](http://localhost:3000/getByQuery?fields=codGruppo,categoria,nomeCategoria,azienda&page=1&pageSize=2&azienda=LIKE_SRL) |
| `IS` | ?att=IS_NOT%20NULL | ToDo |

> TODO: Documentare operatore IS per cercare IS NOT NULL

## API GET getByQuery

This is an API to get products present in ReparMK file.

**Basic usage**

> /getByQuery

**Response**

| Key | Value | Description |
|---|---|---|
| totalRows | Integer | Total of elements in the query before pagination |
| pageSize | Integer | Number of elements per page |
| pageNumber | Integer | Page number corrisponding to the result query |
| dataReport | Date (ISO 8601) | Data of the data was updated |
| conditions | Array of strings | List of conditions used to query the current result |
| productsIds | Array of strings | List of all products ID's retrieved in this query |
| data | Array of objects | List of the products matched |

**Example**

```json
{
  "totalRows": 134,
  "pageSize": 2,
  "pageNumber": 1,
  "dataReport": "2025-10-01T08:00:04.140Z",
  "conditions": [
    "[Codice Fornitore]='F005229'"
  ],
  "productsIds": [
    "0152106",
    "0152107"
  ],
  "data": [
    {
      "codGruppo": "721",
      "categoria": "72",
      "nomeCategoria": "MELISSA PROMO",
      "dataReport": "2025-10-01T08:00:04.140Z",
      "codiceArticolo": "0152106",
      "undefined": 134
    },
    ...
  ]
}
```

# Usage

> /queryAll
?fields=codGruppo,categoria,nomeCategoria,codiceFornitore&page=1&pageSize=2&codiceFornitore=F005229

## Model usage

```javascript
let params = {
    fields: ['Categoria', 'NomeCategoria', 'Gruppo Merceologico'],
    page: 3,
    pageSize: 25,
    conditions: [
        { field:'azienda', operator: '=', value: 'DC SRL' },
        { field:'lineaProdotto', operator: '=', value: 'L01' },
        { field:'fornitore', operator: 'LIKE', value: '%IMPORT%' },
        { field:'categoria', operator: '>', value: 70 },
        { field:'artSost', operator: '', value: null }
    ]
};
const result = await Product.queryAll(params);
```



| Field | Description |
|---|---|
| fields | Optional. Defaults is DataReport |
| page | Optional. Default is 1 |
| pageSize | Optional. Default is 25 |
| conditions | Optional. Defualt is empty value (to get all products) |


## Response
```javascript
{
  "totalRows": 2,
  "pageSize": 2,
  "pageNumber": 1,
  "dataReport": null,
  "conditions": [
    "[Azienda]='DC SRL' ",
    "[Linea Prodotto]='L01' ",
    "[Fornitore]LIKE'%IMPORT%' ",
    "[Categoria]\u003E70 ",
    "[Art Sost]IS NULL ",
    "[Visibile Catalogo]='Y'"
  ],
  "data": [
    {
      "Categoria": "76",
      "NomeCategoria": "MELISSA ESPOSITORI",
      "Gruppo Merceologico": "MELISSA ESPOSITORI"
    },
    {
      "Categoria": "76",
      "NomeCategoria": "MELISSA ESPOSITORI",
      "Gruppo Merceologico": "MELISSA ESPOSITORI"
    }
  ]
}
```

## Get Categories

> /getCategories?NomeCategoria=PRYMART

Returns the name of the categories present in the ReparMk

```JSON
{
  "pageSize": 999,
  "pageNumber": 1,
  "dataReport": null,
  "conditions": [
    "[Visibile Catalogo]='Y' ",
    "[Visibile Catalogo]='Y'"
  ],
  "data": [
    "CALDO CASA",
    ...
    "PRYMART"
  ]
}
```

## Get Providers

> /getProviders?Fornitore=CARDEA%20SRL

Returns the name of the providers present in the ReparMk

```JSON
{
  "pageSize": 999,
  "pageNumber": 1,
  "dataReport": null,
  "conditions": [
    "[Visibile Catalogo]='Y' ",
    "[Fornitore]\u003C\u003E'NULL' ",
    "[Visibile Catalogo]='Y'"
  ],
  "data": [
    "3 F SRL",
    ...
    "ZASEVES DI ZANETTI SEVERINO SRLS"
  ]
}
```

## Using Mocks

Set the variable `USE_MOCK` your `.env` file to get a set of mocked products.

## Environment variables

|Variable | Description |
|---|---|
| PORT | |
| DB_SERVER |  |
| DB_PORT |  |
| DB_NAME | Darwin |
| DB_USER ||
| DB_PASSWORD ||
| USE_MOCK | 1 |

## Known issues

* Ogni elemento di Response.data contiene l'attributo "DataReport" che è già presente alla radice dell'oggetto
* Il sistema debe eliminare duplicati dei parametri di fields
* Evitare de usare try catch e usare invece promises
* Documentare l'uso delle variabili di ambiente
* Pagina 404 non funziona
* Implementare @JSDoc
* Response using operators shows the operator character as an HTML entitity `Ex: [Perio_Ven_Riord]\u003E60"`
* Move to /api/getByQuery (Add /api)

```SQL
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'ReparMk'
```
