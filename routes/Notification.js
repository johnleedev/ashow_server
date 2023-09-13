const express = require('express');
const router = express.Router()
var cors = require('cors');
router.use(cors());

router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');
const axios = require('axios');

const admin = require("firebase-admin");
var serviceAccount = require("../ashow-d014e-firebase-adminsdk-q4cz0-9f4afcf83c.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

router.post('/allsend', async (req, res) => {
  
  const { notifiTitle, notifiBody } = req.body;

  let deviceToken = [
    'fjdBESQ28U5sofP0i3l-EF:APA91bGjyzufFVfkUoXkToxizVadB1sAo1G9nC8ttf5nnbpmxDGcb6W780ZOWikK8qLShIwQB8shhRr9N3Hfvkhl1fM2L_T6Txp0VHZEilWiW1y1rDJGgBHWrXMveDwPEBAgEWy4eOS5',
    'e2-dZzfHS1-Ti_QKigbOnP:APA91bHQWsSy_T8ccRmAuN-OY6h50DlRechwU3ZcjRXIl0mz5td0CbaUlsPouEBuRjKeohzWJBzFyl07GTbdfLya-QFHkhbeaA_OjJFlxDtCQES0JnulQ0GRrucNBaVEJuqeVUIVfoG-'
  ]

  let message = {
    tokens: deviceToken,
    notification: {
      title: notifiTitle,
      body: notifiBody ,
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