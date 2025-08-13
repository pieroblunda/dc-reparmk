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

const getUserCategories = async (req, res) => {
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
      cte_category_user as (
        select distinct cp.category_id
        from company_user cu
        join products p on cu.company_id = p.company_id
        join category_product cp on p.id = cp.product_id
        where cu.user_id = @user_id
      )
      select
        c.code CodiceFornitore,
        c.name as RagioneSocialeFornitore
      from categories c
      join cte_category_user cte on c.id = cte.category_id
      order by c.name
    `;

    const queryResult = await pool.request()
      .input('user_id', sql.Int(), authUserId)
      .query(query);

    if (queryResult.recordset.length === 0) {
      res.status(200).json(new ResponseModel('OK', [], null, 0, req.session.user));

      return;
    }

    const categories = queryResult.recordset;

    res.status(200).json(new ResponseModel('OK', categories, null, categories.length, req.session.user));
  } catch (err) {
    console.log('Errors: ' + err);
    res.status(500).json(new ResponseModel('ERR', null, err));
  }
}

module.exports = { getUserCategories };
