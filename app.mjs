import express from 'express'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const app = express()
const PORT = process.env.PORT || 3000; 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.send('Hello Express from Render 😍😍😍. <a href="barry">barry</a>')
})

// endpoints...middlewares...apis? 
// send an html file

app.get('/barry', (req, res) => {
  // res.send('barry. <a href="/">home</a>')
  res.sendFile(join(__dirname, 'public', 'barry.html')) 

})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
