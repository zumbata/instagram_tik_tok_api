const view = {
	heading : `
		<h1>Tik Tok</h1>
	`,
	logged : {
		root : `
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
		`,

	},
	notLogged : {
		root : `
			Okay, go <a href='tik_tok/login'>log yourself</a>
		`,
		login : `
			<form method="post">
				<label>Login with email or username </label>
				<br><br>
				<label>With email</label>
				<input type="radio" name="email_username" value="email" checked>
				<label>With username</label>
				<input type="radio" name="email_username" value="username">
				<br>
				<label>Email: </label>
				<input type="email" name="email">
				<br>
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