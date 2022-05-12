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
const e = require('express');



if (app.get("env") === "production") {
  // Serve secure cookies, requires HTTPS
  session.cookie.secure = true;
}




app.use(session({
	key: 'session_cookie_name',
	secret: 'session_cookie_secret',
	store: new MySQLStore({
        host:process.env.DB_HOST,
        port:process.env.DB_PORT,
        user:process.env.DB_USER,
        password: process.env.DB_PASS,
        database:process.env.DB_DATABASE
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
        res.redirect('/403');
    }
}

function isNotAuth(req,res,next)
{
    if(req.isAuthenticated())
    {
      res.redirect('/403');
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
        res.redirect('/403');
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
  res.render('index.ejs',{logged : loggedin})
})

app.get('/vip', (req, res) => {
  res.render('tsukiVIP.ejs',{logged : loggedin})
})



app.get('/game', checkLogin, (req, res) => {

 

  if (req.query.jlpt === 'n5'){
    connection.query("SELECT * FROM jlpt.n5", (err, result, fields) => {
      if (err) throw err;
      const numOfResults = result.length
      const startId = 0
      
      res.render('game.ejs',{logged : loggedin, db : result, numOfResults, startId})
    })
  } else {
    connection.query("SELECT * FROM jlpt.n4 LIMIT 1650", (err, result, fields) => {
      if (err) throw err;
      const numOfResults = result.length
      const startId = 600
      
      res.render('game.ejs',{logged : loggedin, db : result, numOfResults, startId})
    })
  }
  
})

app.get('/login', isNotAuth, (req, res) => {
  res.render('login.ejs')
})

app.get('/collection/home', isAuth, (req, res) => {
  connection.query("SELECT * FROM jlpt.n5", (err, result, fields) => {
    if (err) throw err;
    const numOfResults = result.length
    connection.query("SELECT word_id, count FROM user.collections WHERE user_id=?",[req.user.id], (err, counter) => {
      if (err) throw err
      connection.query("SELECT SUM(count) AS total FROM user.collections where user_id=?", [req.user.id], (err,sum) => {
        if (err) throw err
          connection.query(`SELECT word_id,count AS HighestCount
          FROM user.collections WHERE user_id=?
          ORDER BY count DESC
          LIMIT 6`, [req.user.id], (err,topHighest) => {
            if (err) throw err
            console.log(topHighest)
            res.render('collection.ejs',{db : result, page: 0, sum, counter, numOfResults, topHighest})
        })
      })
    })
  })
})

app.get('/collection/n4', isAuth, (req, res) => {
  connection.query("SELECT * FROM jlpt.n4 LIMIT 0, 1622", (err, result, fields) => {
    if (err) throw err;
    const resPerPages = 30

    const numOfResults = result.length
    const numOfPages = Math.ceil(numOfResults / resPerPages)
    let page = req.query.page ? Number(req.query.page) : 1
    
    if (page > numOfPages){
      res.redirect('/?page='+encodeURIComponent(numOfPages))
    } else if (page < 1){
      res.redirect('/?page='+encodeURIComponent('1'))
    }
    // SQL LIMIT starting num
    const startingLimit = (page - 1) * resPerPages

    // GET the relevant number of POSTS for starting page

    connection.query("SELECT * FROM jlpt.n4 LIMIT ?,?", [startingLimit,resPerPages] ,(err, result) => {
      if (err) throw err
      let iterator = ( page - 5 ) < 1 ? 1 : page - 5
      let endingLink = (iterator + 9) <= numOfPages ? (iterator + 9) : page + (numOfPages - page)
      if (endingLink < (page + 4)){
        iterator -= (page + 4) - numOfPages
      }

      connection.query("SELECT word_id, count FROM user.collections WHERE user_id=?",[req.user.id], (err, counter) => {
        if (err) throw err

        connection.query("SELECT SUM(count) AS total FROM user.collections where user_id=?", [req.user.id], (err,sum) => {
          if (err) throw err
         
  
          res.render('collection.ejs', {db : result, page, iterator, endingLink, numOfPages, counter, sum, numOfResults, n : 'n4'})

        })
        
      })
     
    })

    
  })
})

app.get('/collection/n5', isAuth, (req, res) => {
  connection.query("SELECT * FROM jlpt.n5", (err, result, fields) => {
    if (err) throw err;
    const resPerPages = 30

    const numOfResults = result.length
    const numOfPages = Math.ceil(numOfResults / resPerPages)
    let page = req.query.page ? Number(req.query.page) : 1
    
    if (page > numOfPages){
      res.redirect('/?page='+encodeURIComponent(numOfPages))
    } else if (page < 1){
      res.redirect('/?page='+encodeURIComponent('1'))
    }
    // SQL LIMIT starting num
    const startingLimit = (page - 1) * resPerPages

    // GET the relevant number of POSTS for starting page

    connection.query("SELECT * FROM jlpt.n5 LIMIT ?,?", [startingLimit,resPerPages] ,(err, result) => {
      if (err) throw err
      let iterator = ( page - 5 ) < 1 ? 1 : page - 5
      let endingLink = (iterator + 9) <= numOfPages ? (iterator + 9) : page + (numOfPages - page)
      if (endingLink < (page + 4)){
        iterator -= (page + 4) - numOfPages
      }

      connection.query("SELECT word_id, count FROM user.collections WHERE user_id=?",[req.user.id], (err, counter) => {
        if (err) throw err

        connection.query("SELECT SUM(count) AS total FROM user.collections where user_id=?", [req.user.id], (err,sum) => {
          if (err) throw err
         
  
          res.render('collection.ejs', {db : result, page, iterator, endingLink, numOfPages, counter, sum, numOfResults, n : 'n5'})

        })
        
      })
     
    })

    
  })
})

app.get('/register', isNotAuth,userExists, (req, res) => {
  res.render('register.ejs')
})

app.get('/admin-route',isAdmin,(req, res, next) => {
 
  res.send('<h1>You are admin</h1><p><a href="/logout">Logout and reload</a></p>');

});

app.get('/userAlreadyExists', (req, res, next) => {
  res.send('<h1>Sorry This username is taken </h1><p><a href="/register">Register with different username</a></p>');
  
});

app.get('/403', (req, res, next) => {

  res.render('403.ejs')
  
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



app.post('/send', checkLogin, (req,res,next)=>{

  if (loggedin) {
    connection.query('SELECT * FROM user.collections WHERE user_id=? AND word_id=?', [req.user.id,req.body.id], function(error, results, fields) {
      if (error) 
          {
              console.log("Error query");
          }
      else if(results.length>0)
      {
        connection.query(`SET SQL_SAFE_UPDATES = 0;
        UPDATE user.collections SET count = count + 1 WHERE user_id=? AND word_id=?;
        SET SQL_SAFE_UPDATES = 1;`, [req.user.id,req.body.id], function(error, results, fields){
          if (error) 
          {
              console.log("Error update");
          } else {
            next()
          }
        })
      }
      else {
        connection.query('INSERT INTO user.collections (user_id,word_id,count) VALUES (?,?,1)', [req.user.id,req.body.id], function(error, results, fields){
          if (error) 
          {
              console.log("Error Insert");
          } else {
            next()
          }
  
        })
      }
     
    })
  }
  
  res.status(200).send("ok");
  res.end();

})


// server //


app.listen(PORT, 'localhost', () => {
  console.log(`Server running on port ${PORT}`)
})

