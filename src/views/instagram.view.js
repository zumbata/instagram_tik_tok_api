const view = {
	heading : `
		<h1>Instagram</h1>
	`,
	logged : {
		root : `
			<form method="post" action="instagram/follow">
				<span>Username</span>
				<input type="text" name="username">
				<input type="submit" name="submit" value="Follow">
			</form>
			<form method="post" action="instagram/unfollow">
				<span>Username</span>
				<input type="text" name="username">
				<input type="submit" name="submit" value="Unfollow">
			</form>
			<a href="logout">Logout</a>
		`,

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

export default view;