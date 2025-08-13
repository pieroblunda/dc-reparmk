

/*
|--------------------------------------------------------------------------
| Node Modules
|--------------------------------------------------------------------------
*/

const path = require('path');


const dashboardScript = (req, res) => {
  const filePath = path.resolve(__dirname, './dashboard.js');
  res.sendFile(filePath);
}

const renderDasboard = (req, res) => {
  res.status(200).render('dashboard', { user: req.session.user });
}

module.exports = { dashboardScript, renderDasboard };
