import { Router } from "express"

const router = Router()


//TODO: REMOVE AND REFACTOR ALL HTML WITH VIEWS
const heading = `<h1>Tik Tok</h1>`

router.get("/tik_tok", (req, res) => {
	res.send(`
		${heading}
		Okay, go <a href='tik_tok/login'>log yourself</a>
	`)
})

// LOGIN

router.get("/tik_tok/login", (req, res) => {
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

router.post("/tik_tok/login", (req, res) => {

	res.sendStatus(200)
})

/////////////////

// LIKE & UNLIKE
router.post("/tik_tok/like/:postId", (req, res) => {

	res.sendStatus(200)
})

router.post("/tik_tok/unlike/:postId", (req, res) => {

	res.sendStatus(200)
})

//////////////////

// FOLLOW & UNFOLLOW
router.post("/tik_tok/follow/:userId", (req, res) => {

	res.sendStatus(200)
})

router.post("/tik_tok/unfollow/:userId", (req, res) => {

	res.sendStatus(200)
})

//////////////////

export default router