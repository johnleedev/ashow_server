const express = require('express');
const router = express.Router()
var cors = require('cors');
router.use(cors());

router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');

const axios = require('axios');
// var jwt = require("jsonwebtoken");
// const secretKey = require('../secretKey');

const admin = require("firebase-admin");
var serviceAccount = require("../ashow-d014e-firebase-adminsdk-q4cz0-9f4afcf83c.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

router.post('/allsend', async (req, res) => {
  
  
  // const {iosToken, androidToken} = req.body;
  // console.log(iosToken);
  // console.log(androidToken);

  let deviceToken = [
    'fjdBESQ28U5sofP0i3l-EF:APA91bGjyzufFVfkUoXkToxizVadB1sAo1G9nC8ttf5nnbpmxDGcb6W780ZOWikK8qLShIwQB8shhRr9N3Hfvkhl1fM2L_T6Txp0VHZEilWiW1y1rDJGgBHWrXMveDwPEBAgEWy4eOS5',
    'fKP53BLKQSatC1-xQ00S_f:APA91bE9OhNph68EYnWZlKaS-lNoEFgGJnJz-7M6m24jd4B7xbd_Xg3naMT5GPIPVPwU4q0HWbmkRIrE4W2ONtMcLW3qDrIjRCVJnfyM0sEdUPICUCl26alZikufa0fK4xrGPNvlD2ps'
  ]

  let message = {
    tokens: deviceToken,
    notification: {
      title: '4테스트입니다.',
      body: '4잘가나요?',
    },
    apns: {
      payload: {
        aps: {
          'mutable-content': 1,
        },
      },
      fcm_options: {
        image: 'image-url',
      },
    },
    android: {
      notification: {
        image: 'image-url',
      },
    },
    }
    
  await admin
    .messaging()
    .sendEachForMulticast(message)
    .then(function (response) {
      console.log('Successfully sent', response)
    })
    .catch(function (err) {
      console.log('Error Sending message!!! : ', err)
    })
  
});


module.exports = router;