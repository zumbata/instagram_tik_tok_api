import { Router } from "express"

const router = Router()


//TODO: REMOVE AND REFACTOR ALL HTML WITH VIEWS
const heading = `<h1>Instagram</h1>`

router.get("/instagram", (req, res) => {
	res.send(`
		${heading}
		Okay, go <a href='instagram/login'>log yourself</a>
	`)
})

// LOGIN

router.get("/instagram/login", (req, res) => {
	res.send(`
		${heading}
		<form method="post">
			<label>Username: </label>
			<input type="text" name="username">
			<br>
			<label>Password: </label>
			<input type="password" name="password">
			<br>
			<input type="submit" value="submit">
		</form>
	`)
})

router.post("/instagram/login", (req, res) => {

	res.sendStatus(200)
})

/////////////////

// LIKE & UNLIKE
router.post("/instagram/like/:postId", (req, res) => {

	res.sendStatus(200)
})

router.post("/instagram/unlike/:postId", (req, res) => {

	res.sendStatus(200)
})

//////////////////


export default router