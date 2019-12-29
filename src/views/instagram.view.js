const view = {
	heading : `
		<h1>Instagram</h1>
	`,
	logged : {
		root : {
			ok : `
				<form method="post" action="instagram/want">
					<span>Wanted follows</span>
					<input type="number" name="follows">
					<br>
					<span>Wanted likes</span>
					<input type="number" name="likes">
					<br>
					<input type="submit" name="submit" value="Go">
				</form>
				<a href="logout">Logout</a>
			`,
			notOk : `
				<h2>You have already wanted follows and likes. Wait for it to be done.</h2>
				<a href="logout">Logout</a>
			`,
			done : `
				<h2>Your request for likes and follows has been sent. Now wait for it to be done.</h2>
				<a href="/" style="margin-right: 2em;">Home</a>
				<a href="logout">Logout</a>
			`
		}
		,

	},
	notLogged : {
		root : `
			Okay, go <a href='instagram/login'>log yourself</a>
		`,
		login : `
			<form method="post">
				<label>Username: </label>
				<input type="text" name="username">
				<br>
				<label>Password: </label>
				<input type="password" name="password">
				<br>
				<input type="submit" name="submit" value="Submit">
			</form>
		`
	}
};

export default view