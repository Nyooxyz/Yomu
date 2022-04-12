if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}



const express = require('express')
const passport = require('passport')


const LocalStrategy=require('passport-local').Strategy;
const app = express();
const bodyParser = require("body-parser");
const mysql = require('mysql');
const crypto=require('crypto');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var flash = require('express-flash');
const { builtinModules } = require('module');



if (app.get("env") === "production") {
  // Serve secure cookies, requires HTTPS
  session.cookie.secure = true;
}




app.use(session({
	key: 'session_cookie_name',
	secret: 'session_cookie_secret',
	store: new MySQLStore({
        host:'localhost',
        port:3306,
        user:'root',
        password: 'root',
        database:'cookie_user'
    }),
	resave: false,
    saveUninitialized: false,
    cookie:{
        maxAge:1000*60*60*24,
       
    }
}));





app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/public', express.static('public'));
app.use('/common', express.static('common'));




app.engine('html', require('ejs').renderFile);



PORT = 3000

/*Mysql Connection*/

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: 'root',
  database: "user",
  multipleStatements: true
});
connection.connect((err) => {
  if (!err) {
    console.log("Connected");
  } else {
    console.log("Conection Failed");
  }
});


const customFields={
  usernameField:'uname',
  passwordField:'pw',
};

/*Passport JS*/
const verifyCallback=(username,password,done)=>{
   
  connection.query('SELECT * FROM users WHERE username = ? ', [username], function(error, results, fields) {
     if (error) 
         return done(error);

     if(results.length==0)
     {
         return done(null,false);
     }
     const isValid=validPassword(password,results[0].hash,results[0].salt);
     user={id:results[0].id,username:results[0].username,hash:results[0].hash,salt:results[0].salt};
     if(isValid)
     {
         return done(null,user);
     }
     else{
         return done(null,false);
     }
 });
}

const strategy=new LocalStrategy(customFields,verifyCallback);
passport.use(strategy);

passport.serializeUser((user,done)=>{
  console.log("inside serialize");
  done(null,user.id)
});

passport.deserializeUser(function(userId,done){
  console.log('deserializeUser '+ userId);
  connection.query('SELECT * FROM users where id = ?',[userId], function(error, results) {
          done(null, results[0]);    
  });
});

/*middleware*/
function validPassword(password,hash,salt)
{
    var hashVerify=crypto.pbkdf2Sync(password,salt,10000,60,'sha512').toString('hex');
    return hash === hashVerify;
}

function genPassword(password)
{
    var salt=crypto.randomBytes(32).toString('hex');
    var genhash=crypto.pbkdf2Sync(password,salt,10000,60,'sha512').toString('hex');
    return {salt:salt,hash:genhash};
}


 function isAuth(req,res,next)
{
    if(req.isAuthenticated())
    {
        next();
    }
    else
    {
        res.redirect('/notAuthorized');
    }
}

function isNotAuth(req,res,next)
{
    if(req.isAuthenticated())
    {
      res.redirect('/notAuthorized');
    }
    else
    {
        next();
    }
}

function isAdmin(req,res,next)
{
    if(req.isAuthenticated() && req.user.isAdmin==1)
    {
        next();
    }
    else
    {
        res.redirect('/notAuthorizedAdmin');
    }   
}

function userExists(req,res,next)
{
    connection.query('Select * from users where username=? ', [req.body.uname], function(error, results, fields) {
        if (error) 
            {
                console.log("Error");
            }
       else if(results.length>0)
         {
            res.redirect('/userAlreadyExists')
        }
        else
        {
            next();
        }
       
    });
}

function checkCollection(req,res,next)
{
    connection.query('SELECT * FROM user.collections WHERE user_id=? AND word_id=?', [req.body.uname,req.body.id], function(error, results, fields) {
        if (error) 
            {
                console.log("Error idk why");
            }
        else if(results.length>0)
        {
          connection.query(`SET SQL_SAFE_UPDATES = 0;
          UPDATE user.collections SET count = count + 1 WHERE user_id=? AND word_id=?;
          SET SQL_SAFE_UPDATES = 1;`, [req.body.uname,req.body.id], function(error, results, fields){
            if (error) 
            {
                console.log("Error idk why but progress ig");
            } else {
              next()
            }
          })
        }
        else {
          connection.query('INSERT INTO user.collections (user_id,word_id,count) VALUES (?,?,1)', [req.body.uname,req.body.id], function(error, results, fields){
            if (error) 
            {
                console.log("Error idk why but still progress");
            } else {
              next()
            }

          })
        }
       
    })
}

function checkLogin(req, res, next) {
  if (req.isAuthenticated()) {
    
    loggedin = true
    
    
    next()
    
  } else {
    loggedin = false
  
    
    next()
  }
  

}


/*routes*/



app.get('/', checkLogin, (req, res) => {
  res.render('index.ejs',{logged : loggedin, db : resultData})
})

app.get('/login', isNotAuth, (req, res) => {
  res.render('login.ejs')
})

app.get('/collection', isAuth, (req, res) => {
  res.render('collection.ejs')
})

app.get('/register', isNotAuth,userExists, (req, res) => {
  res.render('register.ejs')
})

app.get('/admin-route',isAdmin,(req, res, next) => {
 
  res.send('<h1>You are admin</h1><p><a href="/logout">Logout and reload</a></p>');

});

app.get('/userAlreadyExists', (req, res, next) => {
  console.log("Inside get");
  res.send('<h1>Sorry This username is taken </h1><p><a href="/register">Register with different username</a></p>');
  
});

app.get('/notAuthorizedAdmin', (req, res, next) => {
  console.log("Inside get");
  res.send('<h1>You are not authorized to view the resource as you are not the admin of the page  </h1><p><a href="/login">Retry to Login as admin</a></p>');
  
});

app.get('/notAuthorized', (req, res, next) => {
  console.log("Inside get");
  res.send('<h1>You are not authorized to view the resource </h1><p><a href="/login">Retry Login</a></p>');
  
}); 

app.get('/logout', (req, res, next) => {
  req.logout()
  res.redirect('/')
})

app.post('/login', isNotAuth,  passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.post('/register',isNotAuth,userExists,(req,res,next)=>{
  console.log("Inside post");
  console.log(req.body.pw);
  const saltHash=genPassword(req.body.pw);
  console.log(saltHash);
  const salt=saltHash.salt;
  const hash=saltHash.hash;

  connection.query('Insert into users(username,hash,salt,isAdmin) values(?,?,?,0) ', [req.body.uname,hash,salt], function(error, results, fields) {
      if (error) 
          {
              console.log("Error");
          }
      else
      {
          console.log("Successfully Entered");
      }
     
  });

  res.redirect('/login');
});

app.post('/send',(req,res,next)=>{
  
  connection.query('SELECT * FROM user.collections WHERE user_id=? AND word_id=?', [req.user.id,req.body.id], function(error, results, fields) {
    if (error) 
        {
            console.log("Error idk why");
        }
    else if(results.length>0)
    {
      connection.query(`SET SQL_SAFE_UPDATES = 0;
      UPDATE user.collections SET count = count + 1 WHERE user_id=? AND word_id=?;
      SET SQL_SAFE_UPDATES = 1;`, [req.user.id,req.body.id], function(error, results, fields){
        if (error) 
        {
            console.log("Error idk why but progress ig");
        } else {
          next()
        }
      })
    }
    else {
      connection.query('INSERT INTO user.collections (user_id,word_id,count) VALUES (?,?,1)', [req.user.id,req.body.id], function(error, results, fields){
        if (error) 
        {
            console.log("Error idk why but still progress");
        } else {
          next()
        }

      })
    }
   
  })

  res.status(200).send("ok");
  res.end();

})



// trying my best //

var resultData = ''

connection.query("SELECT * FROM jlpt.n5", function (err, result, fields) {
  if (err) throw err;
  resultData = result
});

















// server //


app.listen(PORT, 'localhost', () => {
  console.log(`Server running on port ${PORT}`)
})

