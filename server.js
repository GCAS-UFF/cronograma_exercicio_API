var admin = require("firebase-admin");
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var cors = require('cors');
app.use(cors());

const all = require('./user');


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
  let name = req.body.username;
  admin.auth().createUser({
    email: req.body.email,
    password: req.body.password,
    displayName: req.body.username,
  })
    .then((userRecord) => {
      db.collection('users').add({
        name: name,
        userId: userRecord.uid,
        fisioId: req.body.fisioId,
      })
        .then((docRef) => {
          return res.json({ message: userRecord })
        })
        .catch((error) => {
          return res.json({ message: error });
        });

    })
    .catch(function (error) {
      // console.log('Error creating new user:', error);
      return res.json({ message: error });

    });
})

app.get('/user', async (req, res) => {
  let userId = req.query.user
  await admin.auth().getUser(userId)
    .then(userRecord => {
      return res.json({
        userId: userRecord.uid,
        name: userRecord.displayName,
        email: userRecord.email
      })
    })
})
app.get('/exercises', async (req, res) => {
  (async () => {
    let userId = req.query.id
      try {
          let query = db.collection('exercises').where("fisioId", "==", userId).orderBy("startDate", "desc");
          let response = [];
          await query.get().then(querySnapshot => {
          let docs = querySnapshot.docs;
          for (let doc of docs) {
              response.push(doc.data());
          }
          });
          return res.status(200).send(response);
      } catch (error) {
          //console.log(error);
          return res.status(500).send(error);
      }
      })();
  });
  app.get('/activities', async (req, res) => {
    (async () => {
      let id = req.query.id
        try {
            let query = db.collection('activities').where("exerciseId", "==", id).orderBy("prescribedTo", "asc");
            let response = [];
            await query.get().then(querySnapshot => {
            let docs = querySnapshot.docs;
            for (let doc of docs) {
                response.push(doc.data());
            }
            });
            return res.status(200).send(response);
        } catch (error) {
            //console.log(error);
            return res.status(500).send(error);
        }
        })();
    });
app.get('/fisio', async (req, res) => {
  db.collection('users')
    .get()
    .then(
      async querySnapshot => {
        const listUsers = await admin.auth().listUsers()
        const usersAll = listUsers.users.map(user => {
          return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            lastSignInTime: user.metadata.lastSignInTime,
            creationTime: user.metadata.creationTime
          }
        })
        // console.log(users);
        let fisios = querySnapshot.docs.map(doc => ({ ...doc.data() }))
        const fisiosID = [...new Set(fisios.filter(user => user.fisioId != null).map(user => user.fisioId))]
        const retorno = usersAll.filter(fisio => fisiosID.indexOf(fisio.uid) !== -1)
        return res.json(retorno)  
      })
}
)
// app.get('/fisio', async (req, res) => {
//   db.collection('users')
//     .get()
//     .then(
//       querySnapshot => {
//         const users = querySnapshot.docs.map(doc => ({ ...doc.data() }))
//         let fisios = [ ...new Set(users.filter(user => user.fisioId != null).map(user => user.fisioId))]
//         let resposta = await Promise.all(fisios.map(async fisio => {
//           admin.auth().getUser(fisio).
//           then(userRecord => {
//             //console.log(userRecord)    
//             return userRecord        
//           })
//         }
//           )
//         )
//         (async () => {
//           const resultado = await Promise.all(fisios.map(async fisio => {
//           admin.auth().getUser(fisio).
//           then(userRecord => {
//             //console.log(userRecord)    
//             return userRecord        
//           })
//         }
//           ))
//           console.log(resultado)
//           return res.json(resultado)
//         })


//         // users.filter(user => user.fisioId !== null && user.fisioId !== "null").map(user => admin.auth()
//         // .getUser(user.fisioId)
//         // .then(userRecord => fisios.push(
//         //   {fisioId: userRecord.uid,
//         //     email: user.email,
//         //     displayName: user.displayName}
//         // ))
//         // )
//       //   users = users.filter(user => user.fisioId !== null && user.fisioId !== "null")
//       // //   const fisio = Promise.all(users.
//       // //   map(async user => {
//       // //   //   const usuario = admin.auth()
//       // //   //   .getUser(user.fisioId)
//       // //   // console.log((await admin.auth()
//       // //   // .getUser(user.fisioId)).uid)
//       // //   // fisios.push(await admin.auth()
//       // //   // .getUser(user.fisioId))
//       // //   // console.log(fisios)
//       // //   return await (admin.auth()
//       // //   .getUser(user.fisioId))
//       // // }))
//       // users.forEach(user => {
//       //   let resposta = admin.auth()
//       //    .getUser(user.fisioId)
//       //    .then(userRecord => {
//       //     return userRecord
//       //   }
//       //   )
//       //    fisios.push(resposta)
//       // });
//       // // const resposta = await fisio

//       }
//     )
// })

// const getUserById = async (uid) => {
//   admin.auth()
//     .getUser(uid)
//     .then(userRecord => {
//       return userRecord
//     }
//     )

// }

app.listen(process.env.PORT || 8080);