const express = require("express")
const routes = require("./routes/routes")
const app = express();
const PORT = process.env.PORT ?? 3000


app.set('view engine', 'pug')
app.use(routes)

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
})