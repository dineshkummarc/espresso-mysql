/* Loads the MySQL JDBC driver dynamically */
(function () {
	var mysql, driver;
	mysql = new File(extensionPath + '/mysql.jar');
	driver = new URLClassLoader([new URL('jar:' + mysql.toURI() + '!/')]).loadClass('com.mysql.jdbc.Driver').newInstance();

	this.MySQL = {
		getConnection: function (username, password, database) {
			var props = new java.util.Properties();
			props.setProperty('user', username || '');
			props.setProperty('password', password || '');
			return driver.connect('jdbc:mysql://localhost/' + (database || ''), props);
		}
	};
}());
