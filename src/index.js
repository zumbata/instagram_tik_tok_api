import express from "express"
import router from "./routes"
import session from "express-session"
import cron from "node-cron"
import * as functions from "./inc/functions"

const app = express()

app.use(express.urlencoded())
app.use(session({secret: 'secretKey123'}));
app.use(router)

app.all("*", (req, res) => {
	res.status(404).send("Not found")
})

app.listen(8080, () => {
	console.log("Server is listening on port 8080")
})

var job = cron.schedule("* * * * *", functions.follow_cron)