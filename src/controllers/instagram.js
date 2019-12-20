import { Router } from "express";
import { IgApiClient , IgCheckpointError, IgLoginTwoFactorRequiredError, IgLoginBadPasswordError} from 'instagram-private-api';
import Bluebird from 'bluebird';
import view from '../views/instagram.view'
import * as functions from '../inc/functions'
import { get } from 'lodash';

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

router.post("/instagram/login", (req, res) => {
	sess = req.session;
	var username = req.body.username, password = req.body.password;
	ig.state.generateDevice(username);
	Bluebird.try(async () => {
		sess.user = await ig.account.login(username, password);
		res.redirect('/instagram');
	}
	).catch(
		IgCheckpointError,
		async () => {
			await ig.challenge.auto(true);
			res.redirect('/instagram/sendCode?type=sms');
		}
	).catch(
		IgLoginTwoFactorRequiredError,
		async (err) => {
			const twoFactorIdentifier = get(err, 'response.body.two_factor_info.two_factor_identifier');
			if (!twoFactorIdentifier) {
				res.send('Unable to login, no 2fa identifier found');
				return;
			}
			res.redirect(`/instagram/sendCode?type=tfa?username=${username}&tfi=${twoFactorIdentifier}`);
		},
	).catch(
		IgLoginBadPasswordError, 
		() => {
			res.status(401).send("Wrong password");
		}
	);
});

router.get("/instagram/sendCode", (req, res) => {
	sess = req.session;
		res.send(`
			${view.heading}
			<form method="post">
			<label>Enter the code from the SMS: </label>
			<input type="text" name="code">
			<input type="hidden" name="type" value="${req.query.type}">
			<input type="hidden" name="username" value="${req.query.username}">
			<input type="hidden" name="tfi" value="${req.query.tfi}">
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
	if(req.body.type == "sms") {
		Bluebird.try(async () => {
			sess.user = await ig.challenge.sendSecurityCode(req.body.code);
			res.redirect('/instagram');
		}).catch(async () => {
			res.redirect('/instagram/wrongCode');
		});
	}
	else if(req.body.type == "tfa") {
		Bluebird.try(async () => {
			sess.user = await ig.account.twoFactorLogin({
				username: req.body.username,
				verificationCode: req.body.code,
				twoFactorIdentifier: req.body.tfi,
				verificationMethod: '1',
				trustThisDevice: '1',
			  });
			res.redirect('/instagram');
		}).catch(async () => {
			res.redirect('/instagram/wrongCode');
		});
	}
	else 
		res.redirect('/instagram/login');
});

router.all('/logout',(req,res) => {
	if(typeof req.session !== "undefined")
	{
		req.session.destroy();
		sess = undefined;
	}
	res.redirect('/instagram');
});

router.post("/instagram/follow", async (req, res) => {
	sess = req.session;
	if(typeof sess.user === "undefined") {
		res.redirect('/instagram/login');
		return;
	}
	Bluebird.try(async () => {
		await ig.friendship.create(await functions.getUid(req.body.username));
		res.sendStatus(200);
	}).catch(async () => {
		res.status(404).send("Not found user!");
	});
});

router.post("/instagram/unfollow", async (req, res) => {
	sess = req.session;
	if(typeof sess.user === "undefined") {
		res.redirect('/instagram/login');
		return;
	}
	Bluebird.try(async () => {
		await ig.friendship.destroy(await functions.getUid(req.body.username));
		res.sendStatus(200);
	}).catch(async (err) => {
		res.status(404).send("Not found user!");
	});
});

export default router;