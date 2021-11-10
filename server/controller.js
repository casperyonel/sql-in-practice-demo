require('dotenv').config()
const {CONNECTION_STRING} = process.env
const Sequelize = require('sequelize')

const sequelize = new Sequelize(CONNECTION_STRING, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }
})

const userId = 4
const clientId = 3

// getUserInfo: 

module.exports = {
   getUserInfo: (req, res) => {
       sequelize.query(`
       SELECT * FROM cc_clients AS c
       JOIN cc_users AS u ON c.user_id = u.user_id
       WHERE u.user_id = ${userId}`)
        .then((dbResult) => {
            console.log(dbResult)
            res.status(200).send(dbResult[0])
            // this returns the 0 index of the array with only one index, and accesses that info inside it
        })
        .catch(err => console.log(err))
   },
   updateUserInfo: (req, res) => {
       // grabbing all of our input values, via req.body
        let {
            firstName,
            lastName,
            phoneNumber,
            email,
            address,
            city,
            state,
            zipCode
        } = req.body
        // destructuring those properties off of the body from the user input, which comes in the form of a body

        sequelize.query(`update cc_users set first_name = '${firstName}',
        last_name = '${lastName}',
        email = '${email}',
        phone_number = ${phoneNumber}
        where user_id = ${userId};

        update cc_clients set address = '${address}',
        city = '${city}',
        state = '${state}',
        zip_code = ${zipCode}
        where user_id = ${userId};`)
        // Update the user table to whatever we typed in, and we're sending in TWO QUERIES HERE
        // update the clients info now with our user inputs
        // there is a pair of single quotes between our deconstructed vars, because we want those AS STRINGS in our DB!!
        // when you typed in Casper on the website, it takes it as a body with double quotes string, but DB interprets this 
        // as a column name, we NEED SINGLE QUOTES!!! So then turns into 'Casper' before getting sent to DB!!!
        //  SO WHENVER SENDING ANYTHING BESIDES NUMBERS TO DB USING BODY, USE SINGLE QUOTES! PARAMS YOU CAN SPECIFY TYPE SO NO NEED REALLY
        // BODY IS ALWAYS SENT AS A STRING

            .then(() => res.sendStatus(200))
            .catch(err => console.log(err))
    },
    getUserAppt: (req, res) => {
        sequelize.query(`SELECT * FROM cc_appointments
        WHERE client_id = ${clientId}
        ORDER BY date DESC`)
            .then((dbResult) => res.status(200).send(dbResult[0]))
            .catch((err) => console.log(err));
        // just grabbing all of the appointments from clientId 4 and ordering by descending date
        // WE DO [0] BECAUSE OUR DB SENDS US IN THE FORM OF AN ARRAY, INSTEAD OF AN OBJECT WHERE .DATA WAS OUR INFO, WE NOW ALWAYSSSS USE [0], [1] WOULD BE OHTER INFO, this is postgreSQL

    },
    requestAppointment: (req, res) => {
        const {date, service} = req.body;

        sequelize.query(`INSERT INTO cc_appointments (client_id, date, service_type, notes, approved, completed)
        VALUES(${clientId}, '${date}', '${service}', 'hellooooo', false, false)
        RETURNING *;`)
            .then((dbResult) => res.status(200).send(dbResult[0]))
            .catch((err) => console.log(err));
        // not approved and not submitted for the false false, helloo is just a comment on the appoitnment
        // returning * means just return all, this is very common
        // date and service were user inputs, so req.body on this .post request from our DB
        // at [0] because we're sending 1 MAINTENANCE REQUEST! if 2 requests would be 0 - 1

        }
}