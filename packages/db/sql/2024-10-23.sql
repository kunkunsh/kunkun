CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL);

-- Extensions table
CREATE TABLE IF NOT EXISTS extensions (
	ext_id INTEGER PRIMARY KEY AUTOINCREMENT,
	identifier TEXT NOT NULL,
	version TEXT NOT NULL,
	enabled BOOLEAN DEFAULT TRUE,
	path TEXT UNIQUE,
	data JSON,
	installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS commands (
	cmd_id INTEGER PRIMARY KEY AUTOINCREMENT,
	ext_id INTEGER NOT NULL,
	name TEXT NOT NULL,
	enabled BOOLEAN DEFAULT TRUE,
	alias TEXT,
	hotkey TEXT,
	type TEXT NOT NULL CHECK (
		type IN (
			'iframe',
			'ui_worker',
			'headless_worker',
			'quick_link',
			'remote'
		)
	),
	data JSON,
	FOREIGN KEY (ext_id) REFERENCES extensions (ext_id)
);

-- Extension Data table
CREATE TABLE IF NOT EXISTS extension_data (
	data_id INTEGER PRIMARY KEY AUTOINCREMENT,
	ext_id INTEGER NOT NULL,
	data_type TEXT NOT NULL,
	data JSON NOT NULL,
	metadata JSON,
	search_text TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (ext_id) REFERENCES extensions (ext_id)
);

-- Full-text search index for ext_data
CREATE VIRTUAL TABLE IF NOT EXISTS extension_data_fts USING fts5 (
	data_id UNINDEXED,
	search_text,
	content = extension_data,
	content_rowid = data_id
);

-- Trigger to update FTS index when extension_data is inserted
CREATE TRIGGER IF NOT EXISTS extension_data_ai AFTER INSERT ON extension_data BEGIN
INSERT INTO
	extension_data_fts (data_id, search_text)
VALUES
	(new.data_id, new.search_text);

END;

-- Trigger to update FTS index when extension_data is updated
CREATE TRIGGER IF NOT EXISTS extension_data_au AFTER
UPDATE ON extension_data BEGIN
INSERT INTO
	extension_data_fts (extension_data_fts, data_id, search_text)
VALUES
	('delete', old.data_id, old.search_text);

INSERT INTO
	extension_data_fts (data_id, search_text)
VALUES
	(new.data_id, new.search_text);

END;

-- Trigger to update FTS index when extension_data is deleted
CREATE TRIGGER IF NOT EXISTS extension_data_ad AFTER DELETE ON extension_data BEGIN
INSERT INTO
	extension_data_fts (extension_data_fts, data_id, search_text)
VALUES
	('delete', old.data_id, old.search_text);

END;

-- Trigger to update 'updated_at' timestamp when extension data is updated
CREATE TRIGGER IF NOT EXISTS update_extension_data_timestamp AFTER
UPDATE ON extension_data BEGIN
UPDATE extension_data
SET
	updated_at = CURRENT_TIMESTAMP
WHERE
	data_id = NEW.data_id;

END;
