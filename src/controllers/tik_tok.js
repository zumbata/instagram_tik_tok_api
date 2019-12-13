import { Router } from "express"
import TikTokAPI, { getRequestParams } from 'tiktok-api';

const signURL = async (url, ts, deviceId) => {
	const as = 'anti-spam parameter 1';
	const cp = 'anti-spam parameter 2'
	const mas = 'anti-spam parameter 3';
	return `${url}&as=${as}&cp=${cp}&mas=${mas}`;
}

const params = getRequestParams({
	device_id: '<device_id>',
	fp: '<device_fingerprint>',
	iid: '<install_id>',
	openudid: '<device_open_udid>',
});

const api = new TikTokAPI(params, { signURL });

const session = require('express-session')
const router = Router()
var sess;

const heading = `<h1>Tik Tok</h1>`

router.get("/tik_tok", (req, res) => {
	sess = req.session;
	if(typeof sess.user !== "undefined") {
		res.send(`
			${heading}
			<form method="post" action="tik_tok/like">
				<span>Post ID:</span>
				<input type="text" name="postId">
				<input type="submit" name="submit" value="Like">
			</form>
			<form method="post" action="tik_tok/unlike">
				<span>Post ID:</span>
				<input type="text" name="postId">
				<input type="submit" name="submit" value="Unlike">
			</form>
			<form method="post" action="tik_tok/follow">
				<span>User ID:</span>
				<input type="text" name="userId">
				<input type="submit" name="submit" value="Follow">
			</form>
			<form method="post" action="tik_tok/unfollow">
				<span>User ID:</span>
				<input type="text" name="userId">
				<input type="submit" name="submit" value="Unfollow">
			</form>
			<a href="logout">Logout</a>
		`);
		return;
	}
	res.send(`
		${heading}
		Okay, go <a href='tik_tok/login'>log yourself</a>
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
		${heading}
		<form method="post">
			<label>Username: </label>
			<input type="text" name="username">
			<br>
			<label>Password: </label>
			<input type="password" name="password">
			<br>
			<input type="submit" name="submit" value="Submit">
		</form>
	`);
})

router.post("/tik_tok/login", (req, res) => {
	sess = req.session;
	var username = req.body.username, password = req.body.password;
	api.loginWithUsername(username, password)
		.then(res1 => {
			if(typeof res1.data.user_id === "undefined")
				res.status(401).send("Wrong username or password");
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