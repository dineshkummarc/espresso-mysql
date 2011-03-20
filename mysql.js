/* Loads the MySQL JDBC driver dynamically */
(function () {
	var mysql, driver, MySQL;
	mysql = new File(extensionPath + '/mysql.jar');
	driver = new URLClassLoader([new URL('jar:' + mysql.toURI() + '!/')]).loadClass('com.mysql.jdbc.Driver').newInstance();

	MySQL = this.MySQL = {};

	/* Returns a raw java.sql.Connection object to MySQL */
	MySQL.getConnection = function (username, password, database) {
		var props = new java.util.Properties();
		props.setProperty('user', username || '');
		props.setProperty('password', password || '');
		return driver.connect('jdbc:mysql://localhost/' + (database || ''), props);
	};

	/* Returns a new instance of MySQLConnection */
	MySQL.open = function (username, password, database) {
		return new MySQLConnection(MySQL.getConnection(username, password, database));
	};

	/* Returns a MySQL-compatible MD5 (without querying the server) */
	MySQL.md5 = function(input) {
		var b, bytes, hash, m;
		m = MessageDigest.getInstance('MD5');
		m.reset();
		bytes = m.digest(new java.lang.String(input).getBytes('UTF-8'));
		hash = '';

		Array.prototype.forEach.apply(bytes, [function (b) {
			var hex = Number(0x00FF & b).toString(16);
			if (hex.length < 2) {
			  hex = '0' + hex;
			}
			hash += hex;
		}]);

		return hash;
	};
}());
