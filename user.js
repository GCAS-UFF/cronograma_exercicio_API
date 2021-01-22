const admin = require("firebase-admin");


let all = async (req, res) => {
    try {
        const listUsers = await admin.auth().listUsers()
        const users = listUsers.users.map(user => {
            return {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                lastSignInTime: user.metadata.lastSignInTime,
                creationTime: user.metadata.creationTime
            }
        })
        // console.log(users);
        return res.json({ message: users});
    } catch (err) {
        // console.log(err);
        return res.json({ message:  err});
    }
 }

 module.exports = all;