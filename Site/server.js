const express = require('express')
const app = express()
app.use(express.json())
const bcrypt = require('bcrypt')

app.set('view-engine', 'ejs')

const users = []
const PORT = 3001

app.get('/', (req, res) => {
  res.render('index.html')
})

app.get('/login', (req, res) => {
  res.render('common/login.html')
})


app.get('/users', (req,res)=>{
  res.json(users)
})

app.post('/users', async (req,res)=>{

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = { name: req.body.name,     password: hashedPassword }
    users.push(user)
    res.status(201).send()
  }
  catch {
    res.status(500).send()
  }

})

app.post('/users/login', async (req,res)=>{
  const user = users.find(user => user.name === req.body.name)
  if (user == null) {
    return res.status(400).send('Cannot find user')
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)){
      res.send('success')
    } else {
      res.send('not allowed')
    }
  } catch {
    res.status(500).send()
  }
})

app.listen(PORT, 'localhost', () => {
  console.log(`Server running on port ${PORT}`)
})
