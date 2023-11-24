const express = require('express');
const router = express.Router()
var cors = require('cors');
router.use(cors());
router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');


router.post('/editprofile', function(req, res){
  const { userAccount, city, county } = req.body;
 
  db.query(`
    UPDATE user SET 
    city = '${city}', 
    county = '${county}'
    WHERE userAccount = '${userAccount}';
    `,function(error, result){
    if (error) {throw error}
    if (result.affectedRows > 0) {
      res.send(true); 
      res.end();
    } else {
      res.send(false); 
      res.end();
    }})
});




module.exports = router;