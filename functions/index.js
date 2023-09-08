const functions = require('firebase-functions');
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendnotofi = functions.https.onRequest((request, response) => {
  
  let deviceToken = [
    'fjdBESQ28U5sofP0i3l-EF:APA91bGjyzufFVfkUoXkToxizVadB1sAo1G9nC8ttf5nnbpmxDGcb6W780ZOWikK8qLShIwQB8shhRr9N3Hfvkhl1fM2L_T6Txp0VHZEilWiW1y1rDJGgBHWrXMveDwPEBAgEWy4eOS5',
    'fKP53BLKQSatC1-xQ00S_f:APA91bE9OhNph68EYnWZlKaS-lNoEFgGJnJz-7M6m24jd4B7xbd_Xg3naMT5GPIPVPwU4q0HWbmkRIrE4W2ONtMcLW3qDrIjRCVJnfyM0sEdUPICUCl26alZikufa0fK4xrGPNvlD2ps'
  ]
  
  admin.messaging().sendEachForMulticast(
    {
      data: {
        title:'테스트 발송',
        body:'테스트 푸쉬 알람!',
      },
      tokens: deviceToken
    },
    ) .then(function (response) {
      console.log('Successfully sent', response.successCount)
    })
    .catch(function (err) {
      console.log('Error Sending message!!! : ', err)
    })

  functions.logger.info("john send success!!", {structuredData: true});
  response.send("john send success");
});
