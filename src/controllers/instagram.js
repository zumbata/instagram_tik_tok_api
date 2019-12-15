import { Router } from "express";
import { IgApiClient, IgCheckpointError } from 'instagram-private-api';
import Bluebird from 'bluebird';
import view from '../views/instagram.view'

const session = require('express-session')
const ig = new IgApiClient();
const router = Router();
var sess;

router.get("/instagram", (req, res) => {
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
});

router.get("/instagram/login", (req, res) => {
	sess = req.session;
	if(typeof sess.user !== "undefined") {
		res.redirect('/instagram');
		return;
	}
	res.send(`
		${view.heading}
		${view.notLogged.login}
	`);
});

router.post("/instagram/login", async (req, res) => {
	sess = req.session;
	var username = req.body.username, password = req.body.password;
	ig.state.generateDevice(username);
	Bluebird.try(async () => {
		sess.user = await ig.account.login(username, password);
		res.redirect('/instagram');
	}).catch(async () => {
		await ig.challenge.auto(true);
		res.redirect('/instagram/sendCode');
	});
});

router.all('/logout',(req,res) => {
	if(typeof req.session !== "undefined")
	{
		req.session.destroy();
		sess = undefined;
	}
	res.redirect('/instagram');
});

router.get("/instagram/sendCode", (req, res) => {
	sess = req.session;
	res.send(`
		${view.heading}
		<form method="post">
		<label>Enter the code from the SMS: </label>
		<input type="text" name="code">
		<br>
		<input type="submit" value="submit">
		</form>
	`);
});

router.get("/instagram/wrongCode", (req, res) => {
	sess = req.session;
	res.send(`
		<h1>Wrong code! Go try again.</h1>
		<a href="instagram/login">Login</a>
	`);
});

router.post("/instagram/sendCode", (req, res) => {
	sess = req.session;
	Bluebird.try(async () => {
		sess.user = await ig.challenge.sendSecurityCode(code);
		res.redirect('/instagram');
		
	}).catch(async () => {
		res.redirect('/instagram/wrongCode');
	});
});

router.post("/instagram/like", (req, res) => {
	sess = req.session;
	if(typeof sess.user === "undefined") {
		res.redirect('/instagram/login');
		return;
	}
	Bluebird.try(async () => {
		await ig.media.like({
			mediaId: req.body.postId,
			moduleInfo: {
				module_name: 'profile',
				user_id: sess.user.pk,
				username: sess.user.username,
			},
			d: 1
		});
		res.sendStatus(200);
	}).catch(async () => {
		res.status(404).send("Not found post!");
	});
});

router.post("/instagram/unlike", (req, res) => {
	sess = req.session;
	if(typeof sess.user === "undefined") {
		res.redirect('/instagram/login');
		return;
	}
	Bluebird.try(async () => {
		await ig.media.unlike({
			mediaId: req.body.postId,
			moduleInfo: {
				module_name: 'profile',
				user_id: sess.user.pk,
				username: sess.user.username,
			}
		});
		res.sendStatus(200);
	}).catch(async () => {
		res.status(404).send("Not found post!");
	});
});

export default router;