CREATE TABLE IF NOT EXISTS command_aliases (
    alias_id INTEGER PRIMARY KEY AUTOINCREMENT,
    cmd_id INTEGER NOT NULL,
    alias TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cmd_id, alias),
    FOREIGN KEY (cmd_id) REFERENCES commands (cmd_id) ON DELETE CASCADE
);

ALTER TABLE commands ADD COLUMN usage_count INTEGER DEFAULT 0;
ALTER TABLE commands ADD COLUMN last_used_at TIMESTAMP;

-- Create FTS5 virtual table for command_aliases
CREATE VIRTUAL TABLE IF NOT EXISTS command_aliases_fts USING fts5(
    alias_id UNINDEXED,
    alias,
    content = command_aliases,
    content_rowid = alias_id,
    tokenize = 'unicode61 remove_diacritics 2'
);

-- Trigger to update FTS index when command_aliases is inserted
CREATE TRIGGER IF NOT EXISTS command_aliases_ai AFTER INSERT ON command_aliases BEGIN
    INSERT INTO command_aliases_fts(alias_id, alias)
    VALUES (new.alias_id, new.alias);
END;

-- Trigger to update FTS index when command_aliases is updated
CREATE TRIGGER IF NOT EXISTS command_aliases_au AFTER UPDATE ON command_aliases BEGIN
    INSERT INTO command_aliases_fts(command_aliases_fts, alias_id, alias)
    VALUES ('delete', old.alias_id, old.alias);
    
    INSERT INTO command_aliases_fts(alias_id, alias)
    VALUES (new.alias_id, new.alias);
END;

-- Trigger to update FTS index when command_aliases is deleted
CREATE TRIGGER IF NOT EXISTS command_aliases_ad AFTER DELETE ON command_aliases BEGIN
    INSERT INTO command_aliases_fts(command_aliases_fts, alias_id, alias)
    VALUES ('delete', old.alias_id, old.alias);
END;


