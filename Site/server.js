if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}


const express = require('express')
const app = express()
app.use(express.json())
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')


app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false}))

app.use('/public', express.static('public'));
app.use('/common', express.static('common'));



app.engine('html', require('ejs').renderFile);

const users = [] // for now
const PORT = 3001
const initPassport = require('./passport-config')
initPassport(
  passport,
  email =>  users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.get('/', (req, res) => {
  res.render('index.ejs')
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.get('/collection', checkAuthenticated, (req, res) => {
  res.render('collection.ejs')
})

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})


app.post('/login', checkNotAuthenticated,  passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.post('/register', checkNotAuthenticated, async (req,res)=>{
   try {
     const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      // If database included, it would be automatically generated so not needed
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')  
   }catch{
     res.redirect('/register')

   }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}




app.listen(PORT, 'localhost', () => {
  console.log(`Server running on port ${PORT}`)
})
