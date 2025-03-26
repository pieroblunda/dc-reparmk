function verifyUser(req, res) {
    if (req.session.user) {
        return true;
    } else {
        res.status(200).render('login');
        return false;
    }
}
module.exports = {
    verifyUser
}