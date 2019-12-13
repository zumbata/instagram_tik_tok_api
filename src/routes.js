import { Router } from "express"
import instagramController from "./controllers/instagram"
import tik_tokController from "./controllers/tik_tok"

const router = Router()

router.get("/", (req, res) => {
	res.send(`
		Hello, see
		<a href="instagram">Instagram</a> or 
		<a href="tik_tok">Tik Tok<a/>
	`)
})

router.use(instagramController)
router.use(tik_tokController)

export default router