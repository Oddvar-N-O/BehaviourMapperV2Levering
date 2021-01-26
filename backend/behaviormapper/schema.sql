DROP TABLE IF EXISTS [Users];

CREATE TABLE "Users" (
	"id"	INTEGER NOT NULL UNIQUE,
	"feideinfo"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);

DROP TABLE IF EXISTS [Map];

CREATE TABLE IF NOT EXISTS [Map] (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR NOT NULL,
    startdate DATETIME NULL,
    enddate DATETIME NULL,
    zoom VARCHAR NULL,
    u_id INTEGER,
    FOREIGN KEY (u_id) REFERENCES "Users"(id)
);


DROP TABLE IF EXISTS [Person];

CREATE TABLE IF NOT EXISTS [Person] (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
    m_id INTEGER NOT NULL, 
    visible BOOLEAN NOT NULL, 
    color VARCHAR NULL, 
    other_attributes VARCHAR NULL,
    FOREIGN KEY (m_id) REFERENCES [Map](id)
);

DROP TABLE IF EXISTS [Event];

CREATE TABLE IF NOT EXISTS [Event] (
     id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
     description VARCHAR NULL, 
     direction DECIMAL NULL, 
     center_coordinate VARCHAR NULL, 
     created TIME NULL, 
     visible BOOLEAN NULL, 
     p_id INTEGER NOT NULL,
     FOREIGN KEY (p_id) REFERENCES [Person](id)
);

DROP TABLE IF EXISTS [Map_has_Person];

CREATE TABLE IF NOT EXISTS [Map_has_Person] (
    k_id INTEGER NOT NULL, 
    p_id INTEGER NOT NULL, 
    PRIMARY KEY (k_id, p_id),
    FOREIGN KEY (k_id) REFERENCES [Map](id)
    FOREIGN KEY (p_id) REFERENCES [Person](id)
);
