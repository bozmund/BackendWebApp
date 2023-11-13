import express from 'express'
const port = 8080
const app = express()
const router = express.Router()

app.use(express.json())
app.use('/api',router)

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})