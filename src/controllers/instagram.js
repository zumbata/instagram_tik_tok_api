import {
	Router
} from "express";
import {
	IgApiClient,
	IgCheckpointError,
	IgLoginTwoFactorRequiredError,
	IgLoginBadPasswordError
} from 'instagram-private-api';
import Bluebird from 'bluebird';
import view from '../views/instagram.view'
import expressMongoDb from 'express-mongo-db'
import {
	get
} from 'lodash';

var ObjectId = require('mongodb').ObjectID;

const ig = new IgApiClient();
const router = Router();
var sess;

router.use(expressMongoDb('mongodb://localhost', { useUnifiedTopology: true }));

router.get("/instagram", (req, res) => {
	sess = req.session;
	if (typeof sess.user !== "undefined")
	{
		var users = req.db.db("instagram").collection("users");
		var searchCol = "username"
		var searchVal = sess.user.username
		if (typeof sess.uid !== "undefined")
		{
			searchCol = "_id"
			searchVal = new ObjectId(sess.uid)
		}
		users.findOne({
			[searchCol]: searchVal
		}, (err, item) => {
			if (err) throw err;
			if(req.query.done == 1)
				res.send(`
					${view.heading}
					${view.logged.root.done}
				`);
			else if(
				item.wantedFollows != 0 &&
				item.wantedLikes != 0 
			)
				res.send(`
					${view.heading}
					${view.logged.root.notOk}
				`);
			else
				res.send(`
					${view.heading}
					${view.logged.root.ok}
				`);
		})
		
	}
	else
		res.send(`
			${view.heading}
			${view.notLogged.root}
		`);
});
router.get("/instagram/login", (req, res) => {
	sess = req.session;
	if (typeof sess.user !== "undefined")
		res.redirect('/instagram');
	else
		res.send(`
			${view.heading}
			${view.notLogged.login}
		`);
});
router.post("/instagram/login", (req, res) => {
	sess = req.session;
	var username = req.body.username,
		password = req.body.password;
	ig.state.generateDevice(username);
	Bluebird.try(() => {
		sess.user = ig.account.login(username, password);
		var users = req.db.db("instagram").collection("users");
		users.findOne({
			username: username
		}, (err, item) => {
			if (err) throw err;
			if (!item)
				users.insertOne({
					username: username,
					password: password,
					wantedFollows: 0,
					wantedLikes: 0,
					following : []
				}, (err, res2) => {
					if (err) throw err;
					sess.uid = res2.ops[0]._id;
				})
			else
				sess.uid = item._id;
			res.redirect('/instagram');
		})
	}).catch(
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
	if (req.body.type == "sms") {
		Bluebird.try(async () => {
			sess.user = await ig.challenge.sendSecurityCode(req.body.code);
			res.redirect('/instagram');
		}).catch(async () => {
			res.redirect('/instagram/wrongCode');
		});
	} else if (req.body.type == "tfa") {
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
	} else
		res.redirect('/instagram/login');
});
router.all('/logout', (req, res) => {
	if (typeof req.session !== "undefined") {
		req.session.destroy();
		sess = undefined;
	}
	res.redirect('/instagram');
});

router.post("/instagram/want", (req, res) => {
	sess = req.session;
	if (typeof sess.user === "undefined")
		res.redirect('/instagram/login');
	else {
		var follows = req.body.follows, likes = req.body.likes;
		var users = req.db.db("instagram").collection("users");
		users.updateOne({
			_id: new ObjectId(sess.uid)
		}, {
			$set: {
				wantedFollows: follows,
				wantedLikes: likes
			}
		}, (err) => {
			if (err) throw err;
			res.redirect('/instagram?done=1');
		})
	}
});

export default router;