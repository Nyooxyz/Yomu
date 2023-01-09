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
var kuromoji = require("kuromoji");
const puppeteer = require('puppeteer');
const { Console } = require('console');
const { send } = require('process');
var path = []
var japTxt = ""
let dontTransi = false
let userJlpt = 5

function fuzzing(ivl){
  // Calculate the maximum amount of fuzz to add, which is 20% of the interval
  const maxFuzz = ivl * 0.2;
  
  // Generate a random number between 0 and the maximum fuzz value
  const fuzz = Math.random() * maxFuzz;
  
  // Calculate the lower and upper bounds for the interval by subtracting and adding
  // half of the fuzz value
  const lowerBound = ivl - fuzz / 2;
  const upperBound = ivl + fuzz / 2;
  
  // Return the interval with the fuzz applied
  return Math.random() * (upperBound - lowerBound) + lowerBound;
}


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

/* --                                                MYSQL                                                                -- */

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











/* --                                                PASSPORT JS                                                                -- */
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










/* --                                                MIDDLEWARES                                                                -- */

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





/* --                                                ROUTES                                                                -- */


app.get('/', checkLogin, (req, res) => {
  connection.query("SELECT * FROM jlpt.n5 UNION SELECT * FROM jlpt.n4", (err, result, fields) => {
    if (err) throw err;
    const numOfResults = result.length
    const startId = 0

    if (loggedin) {
      connection.query("SELECT COUNT(*) FROM user.userdeck WHERE user_id=?",[req.user.id], (err, cardTotal, fields) => {
        if (err) throw err
        
        res.render('index.ejs',{logged : loggedin, db : result, numOfResults, startId, cardTotal: cardTotal[0]['COUNT(*)'], userJlpt})
      })
    } else {
      res.render('index.ejs',{logged : loggedin, db : result, numOfResults, startId, userJlpt})
    }


         
  })
})

app.get('/kuro', checkLogin, (req,res) => {
  res.render('kuro.ejs', {logged : loggedin, txtd : path, txtdJap : japTxt, dontTransi : dontTransi})
  path = []
  japTxt = ""
  dontTransi = false
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

app.get('/daily', checkLogin, (req, res) => {
  connection.query("SELECT word_id, kanj, hira FROM user.userdeck WHERE user_id=?", [req.user.id], (err, deck, fields) => {
    if (err) throw err

    res.render('daily.ejs',{logged : loggedin, db : deck})
  })
})

app.get('/deckupdate', checkLogin, (req, res) => {

  let curJlpt = req.user.userJlpt

  // Check if there are cards to review today, stores them into reviewCards
  connection.query("SELECT word_id FROM user.collections WHERE user_id=? AND (state = 'review' AND (DAY(DATE(next_review)) <= DAY(DATE(CURRENT_TIMESTAMP)))) ORDER BY RAND() LIMIT 10",[req.user.id], (err, reviewCards, fields) => {
    if (err) throw err;
    
    // Extract the word_id values from the reviewCards array
    const reviewCardsIds = reviewCards.map(row => row.word_id);
    console.log(reviewCardsIds)
    
    // Build a list of values to be passed to the IN operator
    const inList = reviewCardsIds.length > 0 ? `(${reviewCardsIds.join(',')})` : '(-1)';
    console.log(inList)

    // Stores id of review or master cards to then filter the next query (will need 10 new cards)
    connection.query("SELECT word_id FROM user.collections WHERE user_id=? AND (state = 'review' OR state = 'master')",[req.user.id], (err, reviewORmaster, fields) => {
      if (err) throw err;

      const reviewORmasterIds = reviewORmaster.map(row => row.word_id);
      const inListOR = reviewORmasterIds.length > 0 ? `(${reviewORmasterIds.join(',')})` : '(-1)';

      connection.query(`SELECT * FROM jlpt.n? WHERE word_id NOT IN ${inListOR} ORDER BY RAND() LIMIT 10`, [curJlpt], (err, newCards, fields) => {
        if (err) throw err;

        connection.query(`SELECT * FROM jlpt.n? WHERE word_id IN ${inList}`,[curJlpt], (err, allCards, fields) => {
          if (err) throw err;

          // merge the 2 arrays (the review cards array with the new cards one)
          Array.prototype.push.apply(allCards,newCards);
          let cardTotal = allCards.length

          connection.query(`SELECT * FROM user.userdeck WHERE user_id = ?`,[req.user.id], (err, deckLength, fields) => {
            if (err) throw err;


            if (deckLength.length === 0){
         
              for (let i = 0; i < cardTotal; i++){
                connection.query(`INSERT INTO user.userdeck (user_id,word_id,kanj,hira) VALUES (?,?,?,?)`,[req.user.id,allCards[i].word_id,allCards[i].kanj,allCards[i].hira], (err, allCards, fields) => {
                  if (err) throw err;
                })
              }
            }else{
              
              connection.query('SET SQL_SAFE_UPDATES = 0;DELETE FROM user.userdeck WHERE user_id = ?;SET SQL_SAFE_UPDATES = 1;', [req.user.id], (error, results, fields) => {
                if (error) throw error;
              })
              for (let i = 0; i < cardTotal; i++){
                connection.query(`INSERT INTO user.userdeck (user_id,word_id,kanj,hira) VALUES (?,?,?,?)`,[req.user.id,allCards[i].word_id,allCards[i].kanj,allCards[i].hira], (err, allCards, fields) => {
                  if (err) throw err;
                })
              }
            }
          })
          res.send('Values overwritten');
        })
      })    
    })
  })    
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
    const resPerPages = 42

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
    const resPerPages = 42

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




app.get('/islearning',(req,res) => {
  connection.query('SELECT state FROM user.collections WHERE word_id=? AND user_id=?', [req.query.id,req.user.id], function(error, results, fields) {
    if (error) throw error
    console.log("state = "+results[0].state)
    res.send(results)
  })
})

app.get('/isnew',(req,res) => {

  console.log("inside new")
  connection.query('SELECT * FROM user.collections WHERE user_id=? AND word_id=?', [req.user.id,req.query.id], function(error, results, fields) {
    if (error) throw error
    console.log("id = "+req.query.id)
    console.log("res = "+results.length)
    res.send(results.length == 0)
  })
})
















/* --                                                POST REQUESTS                                                                -- */

app.post('/login', isNotAuth,  passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.post('/kuro', (req, res, next) => {
 
  kuromoji.builder({ dicPath: "node_modules/kuromoji/dict" }).build(function (err, tokenizer) {
    // tokenizer is ready
    path = tokenizer.tokenize(req.body.txt);
    japTxt = req.body.txt
    dontTransi = true
    res.redirect('/kuro')
  });  
 
})

app.post('/scrape', (req,res,next) => {
  (async () => {
      const browser = await puppeteer.launch({
          headless: true
      });
      const page = (await browser.pages())[0];
      await page.goto(req.body.scrapeUrl);
      const extractedText = await page.$eval('*', (el) => {
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNode(el);
          selection.removeAllRanges();
          selection.addRange(range);
          return window.getSelection().toString();
      });

      await browser.close();

      await kuromoji.builder({ dicPath: "node_modules/kuromoji/dict" }).build(function (err, tokenizer) {
        // tokenizer is ready
        path = tokenizer.tokenize(extractedText);
        dontTransi = true
        res.redirect('/kuro')
      }); 
  })();
})

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
        connection.query('INSERT INTO user.collections (user_id,word_id,count,state,next_review,ease,ivl) VALUES (?,?,1,"learning","0000-00-00 00:00:00",2.5,0)', [req.user.id,req.body.id], function(error, results, fields){
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

app.post('/again', checkLogin, (req,res)=>{

  if (loggedin) {    
    connection.query('INSERT INTO user.collections (user_id,word_id,count,state,next_review,ease,ivl) VALUES (?,?,0,"learning",DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 10 MINUTE),2.5,0.0007)', [req.user.id,req.body.id], function(error, results, fields){
      if (error) throw error
      console.log("posted: "+ req.body.id)
    })
  }   
})

app.post('/good', checkLogin, (req,res)=>{

  if (loggedin) {
    connection.query('INSERT INTO user.collections (user_id,word_id,count,state,next_review,ease,ivl) VALUES (?,?,1,"learning",DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 10 MINUTE),2.5,0.007)', [req.user.id,req.body.id], function(error, results, fields){
      if (error) throw error
      console.log("posted: "+ req.body.id)
    })
  }
})

app.post('/easy', checkLogin, (req,res)=>{

  if (loggedin) {
    connection.query('INSERT INTO user.collections (user_id,word_id,count,state,next_review,ease,ivl) VALUES (?,?,1,"review", DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 4 DAY),2.5,4)', [req.user.id,req.body.id], function(error, results, fields){
      if (error) throw error
      console.log("posted: "+ req.body.id)
    })
  }

})



app.put('/dropword', checkLogin, (req,res,next)=>{

  if (loggedin) {
    connection.query('SET SQL_SAFE_UPDATES = 0;DELETE FROM user.userdeck WHERE user_id=? AND word_id=?;SET SQL_SAFE_UPDATES = 1;', [req.user.id,req.body.id], function(error, results, fields) {
      if (error) throw error
      console.log("deleted: "+req.body.id)
    })
  }
  res.send("200 OK")
})



app.put('/good', checkLogin, (req,res)=>{

  if (loggedin) {
    connection.query('SELECT * FROM user.collections WHERE user_id=? AND word_id=?', [req.user.id,req.body.id], function(error, results, fields) {
      if (error) throw error
         
      
        switch (results[0].state) {
          case 'learning':
            connection.query(`SET SQL_SAFE_UPDATES = 0;UPDATE user.collections SET next_review = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY), state = 'review', ivl = 1.0 WHERE user_id=? AND word_id=?;SET SQL_SAFE_UPDATES = 1;`, [req.user.id,req.body.id], function(error, results, fields){
              if (error) throw error
              
            })
            break;
          case 'review':
            // new ivl
            console.log(req.body.id+' ivl: '+results[0].ivl)
            let easedIVL = (results[0].ivl)*(results[0].ease)
            let fuzzedIVL = Math.round(fuzzing(easedIVL))
            console.log("fuzz: "+fuzzedIVL)
     
            let query = `SET SQL_SAFE_UPDATES = 0;UPDATE user.collections SET next_review = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? DAY), ivl=? WHERE user_id=? AND word_id=?;SET SQL_SAFE_UPDATES = 1;`;
            let sql = mysql.format(query, [fuzzedIVL,fuzzedIVL,req.user.id,req.body.id]);
            console.log(sql);


            connection.query('SET SQL_SAFE_UPDATES = 0;UPDATE user.collections SET next_review = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? DAY), ivl=? WHERE user_id=? AND word_id=?;SET SQL_SAFE_UPDATES = 1;', [fuzzedIVL,fuzzedIVL,req.user.id,req.body.id], function(error, results, fields){
              if (error) throw error
                
            })
            break;
          case 'relearning':
            // new ivl
            console.log('ivl: '+results[0].ivl)
            let newIVL = fuzzing(results[0].ivl*0.2)

            if (newIVL < 1) newIVL = 1

            connection.query(`SET SQL_SAFE_UPDATES = 0;UPDATE user.collections SET next_review = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? MINUTE), ivl=?, state = 'review' WHERE user_id=? AND word_id=?;SET SQL_SAFE_UPDATES = 1;`, [newIVL,newIVL,req.user.id,req.body.id], function(error, results, fields){
              if (error) throw error
              
            })
            break;
        }
    })
  }
  res.send("200 OK")
})

app.put('/again', checkLogin, (req,res)=>{

  if (loggedin) {
    connection.query('SELECT * FROM user.collections WHERE user_id=? AND word_id=?', [req.user.id,req.body.id], function(error, results, fields) {
      if (error) throw error
          
      switch (results[0].state) {
        case 'learning':
          console.log("learning")
          connection.query(`SET SQL_SAFE_UPDATES = 0;UPDATE user.collections SET next_review = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 MINUTE) WHERE user_id=? AND word_id=?;SET SQL_SAFE_UPDATES = 1;`, [req.user.id,req.body.id], function(error, results, fields){
            if (error) throw error
            
          })
          break;
        case 'review':
          connection.query(`SET SQL_SAFE_UPDATES = 0;UPDATE user.collections SET next_review = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 MINUTE), state = "relearning", ease = 2.3 WHERE user_id=? AND word_id=?;SET SQL_SAFE_UPDATES = 1;`, [req.user.id,req.body.id], function(error, results, fields){
            if (error) throw error
            
          })
          break;
        case 'relearning':
          connection.query(`SET SQL_SAFE_UPDATES = 0;UPDATE user.collections SET next_review = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 10 MINUTE) WHERE user_id=? AND word_id=?;SET SQL_SAFE_UPDATES = 1;`, [req.user.id,req.body.id], function(error, results, fields){
            if (error) throw error
            
          })
          break;
          
      }
     
    })
  }
  res.send("200 OK")
})


app.put('/easy', checkLogin, (req,res)=>{

  if (loggedin) {
    connection.query('SELECT * FROM user.collections WHERE user_id=? AND word_id=?', [req.user.id,req.body.id], function(error, results, fields) {
      if (error) throw error
          
      
        switch (results[0].state) {
          case 'learning':
            connection.query(`SET SQL_SAFE_UPDATES = 0;UPDATE user.collections SET next_review = (DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY)), state = "review", ivl = 1.0 WHERE user_id=? AND word_id=?;SET SQL_SAFE_UPDATES = 1;`, [req.user.id,req.body.id], function(error, results, fields){
              if (error) throw error
              
            })
            break;
          case 'review':
            // new ivl
            let easedIVL = results[0].ivl*results[0].ease*1.5
            let fuzzedIVL = Math.round(fuzzing(easedIVL))

            connection.query(`SET SQL_SAFE_UPDATES = 0;UPDATE user.collections SET next_review = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? DAY), ease = 2.65, ivl = ? WHERE user_id=? AND word_id=?;SET SQL_SAFE_UPDATES = 1;`, [fuzzedIVL,fuzzedIVL,req.user.id,req.body.id], function(error, results, fields){
              if (error) throw error
              
            })
            break;
          case 'relearning':
            connection.query(`SET SQL_SAFE_UPDATES = 0;UPDATE user.collections SET next_review =  DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 4 DAY), ivl=4 WHERE user_id=? AND word_id=?;SET SQL_SAFE_UPDATES = 1;`, [newIVL,req.user.id,req.body.id], function(error, results, fields){
              if (error) throw error
              
            })
            break;
        }
    })
  }
  res.send("200 OK")
})







/* --                                                SERVER                                                                -- */

app.listen(PORT, 'localhost', () => {
  console.log(`Server running on port ${PORT}`)
})

