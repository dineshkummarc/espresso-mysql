/* Convenient wrapper around java.sql.Connection */
(function () {
	var MySQLConnection = this.MySQLConnection = function (connection) {
		this.connection = connection;
	};

	/* Return a PreparedStatement that will report generated keys */
	MySQLConnection.prototype.prepare = function (query, values) {
		var statement = this.connection.prepareStatement(query, java.sql.Statement.RETURN_GENERATED_KEYS);
		this.populateStatement(statement, values);

		return statement;
	}; 

	/* Run a non-modifying query (SELECT) */
	MySQLConnection.prototype.query = function (statement, values, callback) {
		var results = [], row, columns = [], result, meta, j, n;
		this.populateStatement(statement, values);
		result = statement.executeQuery();
		meta = result.getMetaData();

		/* Determine column names */
		for (j = 1, n = meta.getColumnCount(); j <= n; j += 1) {
			columns.push(String(meta.getColumnName(j)).toLowerCase());
		}

		function populateRow(column, index) {
			row[column] = String(result.getString(index + 1));
		}
		
		while (result.next()) {
			row = {};
			columns.forEach(populateRow);
			/* Stream ResultSet to callback if it exists */
			if (typeof callback === 'function') {
				if (callback.apply(this, [row]) === false) {
					/* If callback returns false, close the ResultSet and return an empty result set */
					result.close();
					return [];
				}
			} else {
				/* If no callback exists, buffer ResultSet into an associative object */
				results.push(row);
			}
		}
		
		return results;
	};

	/* Execute UPDATE/INSERT/REPLACE/DELETE statement */
	MySQLConnection.prototype.execute = function (statement, values) {
		MySQLConnection.prototype.populateStatement(statement, values);

		/* Return generated keys (e.g. auto_increment) */
		statement.executeUpdate();
		var keys = [], generated = statement.getGeneratedKeys();
		while (generated.next()) {
			keys.push(generated.getLong(1));
		}

		return keys;
	};

	/* Set data for a PreparedStatement and return */
	MySQLConnection.prototype.populateStatement = function (statement, values) {
		if (typeof values !== 'undefined') {
			/* Auto-wrap values into an array */
			values = (values.length && values) || [values];
			values.forEach(function (value, index) {
				/* Auto-wrap value into an object */
				if (typeof value.value === 'undefined') {
					value = { value: value };
				}

				/* Add String as default value type */
				if (!value.type) {
					value.type = 'String';
				}

				/* Inject into PreparedStatement */
				statement['set' + value.type.charAt(0).toUpperCase() + value.type.slice(1)](index + 1, value.value);
			});
		}
	};
}());
