const express = require('express');
const router = express.Router()
router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');

// 매물 전체 목록 불러오기
router.get('/buildings', (req, res) => {
  db.query(`
    SELECT * from buildings;
  `, function(error, result, fields) {
    if (error) throw error;
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {              
      res.send(error);
      res.end();
    }            
  });
});

router.get('/pyenginfo/:aptkey', (req, res) => {

  const { aptkey } = req.params;
  db.query(`
    SELECT * from buildingspyenginfo where aptKey = '${aptkey}';
  `, function(error, result, fields) {
    if (error) throw error;
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {              
      res.send(error);
      res.end();
    }            
  });
});

router.get('/search/:word', (req, res) => {

  const { word } = req.params;
  db.query(`
    SELECT * from buildings 
    where name LIKE '%${word}%' OR addressCity LIKE '%${word}%' OR addressCounty LIKE '%${word}%';
  `, function(error, result, fields) {
    if (error) throw error;
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {              
      res.send(error);
      res.end();
    }            
  });

});


module.exports = router;