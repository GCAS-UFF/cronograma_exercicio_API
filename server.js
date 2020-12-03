var admin = require("firebase-admin");
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var cors = require('cors');
app.use(cors());

const all = require('./controller');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
var serviceAccount = require("./credentials.json");
const { json } = require("express");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cronogramas-teste-871db.firebaseio.com"
});

let db = admin.firestore();

app.get('/users', all)

app.post('/users', async (req, res) => {
    // console.log(req);
    // return res.json({message: "req"});
    let name = req.body.username;
    console.log("name1 "+name);
    admin.auth().createUser({
        email: req.body.email,
        password: req.body.password,
        displayName: req.body.username,
      })
      .then((userRecord) => {
        // See the UserRecord reference doc for the contents of userRecord.
        // console.log(userRecord);
        // console.log("name2 "+ name);
        db.collection('users').add({
            name: name,
            userId: userRecord.uid,
            fisioId: req.body.fisioId,
          })
          .then((docRef) => {
            return res.json({ message: userRecord})
          })
          .catch((error) => {
            // The document probably doesn't exist.
            // console.error("Error updating document: ", error);
            return res.json({ message: error});
        });
        
      })
      .catch(function(error) {
        // console.log('Error creating new user:', error);
        return res.json({ message: error});
        
      });
})

app.listen(process.env.PORT || 3000);