import { Router } from "express"
import TikTokAPI, { getRequestParams } from 'tiktok-api';
import view from '../views/tik_tok.view'

const signURL = async (url, ts, deviceId) => {
	const as = '23d22211fe06dcd8a2927b2fbc6cd74d';
	const cp = '164967f5772b6f50e2424c062c804a23'
	const mas = 'd0cbc0a4b4b89fe0525c449c785cc736';
	return `${url}&as=${as}&cp=${cp}&mas=${mas}`;
}

const params = getRequestParams({
	device_id: '6594726280552547846',
	fp: '',
	iid: '6620659482206930694',
	openudid: 'b307b864b574e818',
});

const api = new TikTokAPI(params, { signURL });

const session = require('express-session')
const router = Router()
var sess;

router.get("/tik_tok", (req, res) => {
	sess = req.session;
	if(typeof sess.user !== "undefined") {
		res.send(`
			${view.heading}
			${view.logged.root}
		`);
		return;
	}
	res.send(`
		${view.heading}
		${view.notLogged.root}	
	`);
})

// LOGIN

router.get("/tik_tok/login", (req, res) => {
	sess = req.session;
	if(typeof sess.user !== "undefined") {
		res.redirect('/tik_tok');
		return;
	}
	res.send(`
		${view.heading}
		${view.notLogged.login}
	`);
})

router.post("/tik_tok/login", (req, res) => {
	sess = req.session;
	var email = req.body.email, password = req.body.password,
	username = req.body.username, email_or_username = req.body.email_username,
	func1, field;
	if(email_or_username == "username")
	{
		func1 = api.loginWithEmail;
		field = email;
	}
	else
	{
		func1 = api.loginWithUsername;
		field = username;
	}
	func1(field, password)
		.then(res1 => {
			if(typeof res1.data.user_id === "undefined")
				res.status(401).send(res1.data);
			else
			{
				sess.user = res1.data;
				res.redirect("/tik_tok");
			}
		}).catch(() => {
			res.status(400).send("There were problems with your request. Try again.");
		})
})

router.all('/logout',(req,res) => {
	if(typeof req.session !== "undefined")
	{
		req.session.destroy();
		sess = undefined;
	}
	res.redirect('/tik_tok');
});

/////////////////

// LIKE & UNLIKE
router.post("/tik_tok/like/:postId", (req, res) => {
	sess = req.session;
	if(typeof sess.user === "undefined") {
		res.redirect('/tik_tok/login');
		return;
	}
	api.likePost(req.body.postId)
		.then(res1 => {
			if(typeof res1.data.is_digg === "undefined")
				res.status(404).send("No post with this id.");
			else
				res.redirect("/tik_tok");
		}).catch(() => {
			res.status(400).send("There were problems with your request. Try again.");
		})
})

router.post("/tik_tok/unlike/:postId", (req, res) => {
	sess = req.session;
	if(typeof sess.user === "undefined") {
		res.redirect('/tik_tok/login');
		return;
	}
	api.unlikePost(req.body.postId)
		.then(res1 => {
			if(typeof res1.data.is_digg === "undefined")
				res.status(404).send("No post with this id.");
			else
				res.redirect("/tik_tok");
		}).catch(() => {
			res.status(400).send("There were problems with your request. Try again.");
		})
})

//////////////////

// FOLLOW & UNFOLLOW
router.post("/tik_tok/follow/:userId", (req, res) => {
	sess = req.session;
	if(typeof sess.user === "undefined") {
		res.redirect('/tik_tok/login');
		return;
	}
	api.follow(req.body.userId)
		.then(res1 => {
			if(typeof res1.data.follow_status === "undefined")
				res.status(404).send("No user with this id.");
			else
				res.redirect("/tik_tok");
		}).catch(() => {
			res.status(400).send("There were problems with your request. Try again.");
		})
})

router.post("/tik_tok/unfollow/:userId", (req, res) => {
	sess = req.session;
	if(typeof sess.user === "undefined") {
		res.redirect('/tik_tok/login');
		return;
	}
	api.unfollow(req.body.userId)
		.then(res1 => {
			if(typeof res1.data.follow_status === "undefined")
				res.status(404).send("No user with this id.");
			else
				res.redirect("/tik_tok");
		}).catch(() => {
			res.status(400).send("There were problems with your request. Try again.");
		})
})

//////////////////

export default router