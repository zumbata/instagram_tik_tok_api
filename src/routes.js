import { Router } from "express"
import instagramController from "./controllers/instagram"
import tik_tokController from "./controllers/tik_tok"

const router = Router()

router.all("/", (req, res) => {
	res.send("Hello")
})
router.use(instagramController)
router.use(tik_tokController)

export default router