const express = require('express');
const router = express.Router()
var cors = require('cors');
router.use(cors());

router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');

const axios = require('axios');
var jwt = require("jsonwebtoken");
const secretKey = require('../secretKey');


// 카카오 & 네이버 로그인 로직
router.post('/login/:url', async (req, res) => {
  var url = req.params.url;

  try {
    const { AccessToken } = req.body;
    const apiURL = url.includes('kakao') ?
      'https://kapi.kakao.com/v2/user/me' :
      'https://openapi.naver.com/v1/nid/me';

    const result = await axios({
      method: 'GET', url: apiURL,
      headers: { Authorization: `Bearer ${AccessToken}` }
    });

    const userEmail = url.includes('kakao') ? result.data.kakao_account.email : result.data.response.email;
    const SECRET_KEY = secretKey.key;
    const userURL = url.includes('kakao') ? 'kakao' : 'naver';

    // refreshToken 만들기
    const refreshToken = jwt.sign({ type: 'JWT', USER_ID: userEmail }, SECRET_KEY, {
      expiresIn: '1d',
      issuer: 'ashow'
    });

    // 회원인지 파악하기
    db.query(`SELECT * FROM user WHERE userAccount = '${userEmail}';
    `, function(error, result){
      if (error) {throw error}
      if (result.length === 0) {  
        const userData = {}
        userData.email = userEmail;
        userData.userURL = userURL;
        userData.refreshToken = refreshToken;
        userData.isUser = false;
        res.json(userData);
        res.end();
      } else {
        var json = JSON.stringify(result[0]);
        const userData = JSON.parse(json);
        userData.refreshToken = refreshToken;
        userData.isUser = true;

        if ( userData.userURL === userURL ) {
          res.json(userData);
          res.end();
        } else {
          db.query(
            `UPDATE user SET userURL = '${userURL}' WHERE userAccount = '${userData.userAccount}'`
          );
          userData.userURL = userURL
          res.json(userData);
          res.end();
        }
        
    }})
  

  } catch (error) {
    res.status(500).json({ error: '카카오 & 네이버 로그인 에러' });
  }
});



// 애플 로그인
router.post('/loginsocial/apple', async (req, res) => {
  
  const { userInfo } = req.body;
  const userEmail = userInfo.email;
  
  try {
    const SECRET_KEY = secretKey.key;
    const userURL = 'apple';
    
    // refreshToken 만들기
    const refreshToken = jwt.sign({ type: 'JWT', USER_ID: userEmail }, SECRET_KEY, {
      expiresIn: '30d',
      issuer: 'ashow'
    });

    // 회원인지 파악하기
    db.query(`SELECT * FROM user WHERE userAccount = '${userEmail}';
    `, function(error, result){
      if (error) {throw error}
      if (result.length === 0) {  
        const userData = {}
        userData.email = userEmail;
        userData.userURL = userURL;
        userData.refreshToken = refreshToken;
        userData.isUser = false;
        res.json(userData);
        res.end();

      } else {

        var json = JSON.stringify(result[0]);
        const userData = JSON.parse(json);
        userData.refreshToken = refreshToken;
        userData.isUser = true;

        if ( userData.userURL === userURL ) {
          res.json(userData);
          res.end();
        } else {
          db.query(
            `UPDATE user SET userURL = '${userURL}' WHERE userAccount = '${userData.userAccount}'`
          );
          userData.userURL = userURL
          res.json(userData);
          res.end();
        }
    }})
  } catch (error) {
    res.status(500).json({ error: '애플 로그인 에러' });
  }
});


// 구글 로그인
router.post('/loginsocial/google', async (req, res) => {

  const { user } = req.body;

  try {
    const userEmail = user.email;
    const userURL = 'google';
    const SECRET_KEY = secretKey.key;

    // refreshToken 만들기
    const refreshToken = jwt.sign({ type: 'JWT', USER_ID: userEmail }, SECRET_KEY, {
      expiresIn: '30d',
      issuer: 'ashow'
    });

    // 회원인지 파악하기
    db.query(`SELECT * FROM user WHERE userAccount = '${userEmail}';
    `, function(error, result){
      if (error) {throw error}
      if (result.length === 0) {  
        const userData = {}
        userData.email = userEmail;
        userData.userURL = userURL;
        userData.refreshToken = refreshToken;
        userData.isUser = false;
        res.json(userData);
        res.end();
      } else {
        var json = JSON.stringify(result[0]);
        const userData = JSON.parse(json);
        userData.refreshToken = refreshToken;
        userData.isUser = true;

        if ( userData.userURL === userURL ) {
          res.json(userData);
          res.end();
        } else {
          db.query(
            `UPDATE user SET userURL = '${userURL}' WHERE userAccount = '${userData.userAccount}'`
          );
          userData.userURL = userURL
          res.json(userData);
          res.end();
        }
    }})
  } catch (error) {
    res.status(500).json({ error: '구글 로그인 에러' });
  }
});

// 토큰 검증
router.post('/verifytoken', (req, res)=>{
  const token = req.body.verifyToken;
  const copy = jwt.decode(token);

  const userAccount = copy.USER_ID;
  const SECRET_KEY = secretKey.key;
  const userData = {}

  jwt.verify(token, SECRET_KEY, (error, decoded)=>{
    // torken기한이 만료되었을때
    if(error) {
      if(error.name === 'TokenExpiredError'){
        // user찾아보기
        db.query(`SELECT userAccount FROM user WHERE userAccount = '${userAccount}';
        `,function(error, result){
          if (error) {throw error}
          if (result.length === 0) {  
            userData.isUser = false;
            res.send(userData);
            res.end();
          } else {
            // 다시 발급해주기
            var refreshToken = jwt.sign({type: 'JWT', USER_ID : userAccount }, SECRET_KEY, {
              expiresIn: '30d', 
              issuer: 'ashow'
            });
            userData.refreshToken = refreshToken;
            userData.isUser = true;
            res.json(userData);
            res.end();
        }})
      };  
    } else if (decoded.USER_ID === userAccount) {
     // torken이 유효할 때
      res.send('success');
      res.end();
    }
  })
 
}) 

// logister
router.post('/logisterdo', function(req, res){
  const { userAccount, userNickName, userURL, city, county, checkUpAge14, checkUsingPolicy, 
          checkPersonalInfo, checkContentsRestrict, checkInfoToOthers
        } = req.body;

        db.query(`
  INSERT IGNORE INTO user (userAccount, userNickName, userURL, city, county, checkUpAge14, 
    checkUsingPolicy, checkPersonalInfo, checkContentsRestrict, checkInfoToOthers) VALUES 
  ('${userAccount}', '${userNickName}', '${userURL}', '${city}', '${county}', '${checkUpAge14}', '${checkUsingPolicy}', 
  '${checkPersonalInfo}', '${checkContentsRestrict}', '${checkInfoToOthers}');
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


router.post('/deleteaccount', function(req, res){
  const { userAccount, userNickName } = req.body;

  // 회원 정보 삭제
  db.query(`
  DELETE FROM user WHERE userAccount = '${userAccount}' and userNickName = '${userNickName}'
  `,function(error, result){
  if (error) {throw error}
  if (result.affectedRows > 0) {  
    console.log('성공');
    res.send(true);
    res.end();
  } else {
    console.log('실패');
    res.send("");  
    res.end();
  }})
});



router.post('/loginadmin', function(req, res){
  const { username, password } = req.body;
  console.log('sdkfjls')
  if (username === 'admin' && password === 'it14687&&') {
    res.send(true);
    res.end();
  } else {
    res.send(false);
    res.end();
  }

});


router.post('/nicknamecheck', function(req, res){
  const { userNickName } = req.body;
  db.query(`SELECT * FROM user WHERE userNickName = '${userNickName}';
  `, function(error, result){
    if (error) {throw error}
    if (result.length === 0) {  
      res.send(false);
      res.end();
    } else {
      res.send(true);
      res.end();
  }})
});



module.exports = router;