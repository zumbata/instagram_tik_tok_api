import express from "express"
import router from "./routes"

const session = require('express-session')
const app = express()

app.use(express.urlencoded())
app.use(router)
app.use(session({secret: 'asdasdasd'}));

app.all("*", (req, res) => {
	res.status(404).send("Not found")
})

app.listen(8080, () => {
	console.log("Server is listening on port 8080")
})