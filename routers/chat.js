const express = require("express")

const router = express.Router()

router.get('/', async (req, res) => {
  console.log('get route')
  res.send('get route')
  try {

  } catch (er) {
    res.send('error' + er) 
  }
})

module.exports = router