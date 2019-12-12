import express from "express"
import router from "./routes"

const app = express()

app.use(router)

app.all("*", (req, res) => {
	res.status(404).send("Not found")
})

app.listen(8080, () => {
	console.log("Server is listening on port 8080")
})