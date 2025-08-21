# API ReparMk

# Usage

> http://localhost:5001/queryAll
> http://localhost:5001/queryAll?fields=Categoria,NomeCategoria&page=1&pageSize=25&Fornitore=LIKE_IMPORT&Categoria=%3E_15

## Params

```javascript
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
```

| Field | Description |
|---|---|
| fields | Optional. Defaults is DataReport |
| page | Optional. Default is 1 |
| pageSize | Optional. Default is 25 |
| conditions | Optional. Defualt is empty value (to get all products) |

## Fields

> Is an array of string where the elements match a ReparMK field. See Fields Available.
> Available fields are any of reparMK

| Field | Description |
|---|---|
| | |

> Note: '*' is a valid field to get all available fields
> IMPORTANT: System will automatically adds [DataReport] field in order to show how old is the information showed in UI.

## Conditions
An array of object where each item match the  following schema:

```javascript
{ field:'Visibile Catalogo', operator: '=', value: 'Y' }
```
> IMPORTANT: System automatically will add the rule used as example above in order to query only active products
> NOTE: When value is `NULL` operator will be ignored
> Valid Operators: '=','LIKE', '>','<'

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

## Environment variables

|Variable | Description |
|---|---|
| PORT | |
| DB_SERVER |  |
| DB_PORT |  |
| DB_NAME | Darwin |
| DB_USER ||
| DB_PASSWORD ||

## Debito tecnico

* Ogni elemento di Response.data contiene l'attributo "DataReport" che è già presente alla radice dell'oggetto
* Il sistema risponde con la chiave del ogetto come "Gruppo Merceologico" il chè rende difficile usare la notazione per punto. Valutare di usare camel case.
* ToDo: Fields must be dinamic
* Il sistema debe eliminare duplicati dei parametri di fields
* Evitare de usare try catch e usare invece promises
* Documentare l'uso delle variabili di ambiente
* Pagina 404 non funziona
* Implementare @JSDoc

```
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'ReparMk'
```