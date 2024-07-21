const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
//const path = require('path');


app.use(express.json());
app.use(cors());
dotenv.config();

//connection to the database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

//check if connection works
db.connect((err) => {
    if (err) return console.log("Error connecting to MYSQL");

        console.log("Connected to MYSQL:", db.threadId);


        // create/check database
        db.query(`CREATE DATABASE IF NOT EXISTS expense_tracker`, (err, result) => {
            if(err) return console.log(err);

            console.log("Database expense_tracker created/checked");

            //change our database
            db.changeUser({database:'expense_tracker'}, (err) => {
                if (err) return console.log(err);
                
                console.log("expense_tracker is in use");

                // create user table
            const createdUserstable = `
                CREATE TABLE IF NOT EXISTS user(
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    username VARCHAR(50) NOT NULL,
                    password VARCHAR(255) NOT NULL
                )
            `;

            db.query(createdUserstable, (err, result) =>{
                if(err) return console.log(err);

                console.log("users table created/checked");
            })

        })


      

    })
})


//app.get('', (req, res) => {
  //  res.send("Hell World, this is my server");
//});


// user registration route
app.post('/api/register', async(req, res) => {
    //res.sendFile(path.join(__dirname, "register.html"));
    try{
        const users = `SELECT * FROM users WHERE email = ?`

         //checking if user exists

        db.query(users, [req.body.email], (err, data) =>{
            if(data.length > 0) return res.status(409).json("user already exists");
                 
            //hashing our password
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(req.body.password, salt);

            const createUser = `INSERT INTO users(email, username, password) VALUES (?)`;
            value = [
                req.body.email,
                req.body.username,
                hashedPassword
            ]

            //insert user in db

            db.query(createUser, [value], (err, data) =>{
                if(err) res.status(400).json("Something went wrong");

                return res.status(200).json("user created successfully");
            })
        })

        
    }
    catch (err) {
        res.status(500).json("internal server error");
    }

})

// user login route
app.post('/api/login', async(req, res) => {
    try{
        const users = `SELECT * FROM users WHERE email = ?`

        db.query(users, [req.body.email], (err, data) => {
            if(data.length === 0) return res.status(404).json("User not found");

            //check if password is valid
            const isPasswordValid = bcrypt.compareSync(req.body.password, data[0].password);
            if(!isPasswordValid) return res.status(400).json("Invalid email or password");

            return res.status(200).json("login Successful");
        })
    }

    catch (err) {
       res.status(500).json("Internal server error");

    }
})
//app.listen(5500, () => {
app.listen(5500, function(){    
    console.log('server is running on port 5500');  
});