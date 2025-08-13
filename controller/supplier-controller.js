/*
|--------------------------------------------------------------------------
| NODE MODULES
|--------------------------------------------------------------------------
*/

const sql = require('mssql/msnodesqlv8');

/*
|--------------------------------------------------------------------------
| CUSTOM MODULES
|--------------------------------------------------------------------------
*/

const ResponseModel = require('../models/response-model');
const connection = require('../config.db');

/*
|--------------------------------------------------------------------------
| MODULE EXPORTS
|--------------------------------------------------------------------------
*/

const getUserSuppliers = async (req, res) => {
  try {
    res.set('Access-Control-Allow-Origin', '*');

    const { Id: authUserId } = req.session.user;

    if (req.session.user.OffsetRows < 0) {
      req.session.user.OffsetRows = 0;
    } else {
      req.session.user.OffsetRows = req.session.user.OffsetRows + req.session.user.NextRows;
    }

    const pool = await sql.connect(connection);

    const query = `
      with
      cte_supplier_user as (
        select distinct ps.supplier_id
        from company_user cu
        join products p on cu.company_id = p.company_id
        join product_supplier ps on p.id = ps.product_id
        where cu.user_id = @user_id
      )
      select
        s.code CodiceFornitore,
        s.name as RagioneSocialeFornitore
      from suppliers s
      join cte_supplier_user cte on s.id = cte.supplier_id
      order by s.name
    `;

    const queryResult = await pool.request()
      .input('user_id', sql.Int(), authUserId)
      .query(query);

    if (queryResult.recordset.length === 0) {
      res.status(200).json(new ResponseModel('OK', [], null, 0, req.session.user));

      return;
    }

    const suppliers = queryResult.recordset;

    res.status(200).json(new ResponseModel('OK', suppliers, null, suppliers.length, req.session.user));
  } catch (err) {
    console.log('Errors: ' + err);
    res.status(500).json(new ResponseModel('ERR', null, err));
  }
}

module.exports = { getUserSuppliers };
