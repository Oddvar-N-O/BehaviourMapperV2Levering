DROP TABLE IF EXISTS "Users" ;

CREATE TABLE IF NOT EXISTS "Users" (
	"id"	INTEGER NOT NULL UNIQUE,
	"feideinfo"	VARCHAR NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);

DROP TABLE IF EXISTS [Project];

CREATE TABLE IF NOT EXISTS [Project] (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR NOT NULL,
    description VARCHAR NULL,
    map VARCHAR NULL,
    startdate DATETIME NULL,
    enddate DATETIME NULL,
    zoom VARCHAR NULL,
    u_id INTEGER,
    FOREIGN KEY (u_id) REFERENCES "Users"(id)
);

DROP TABLE IF EXISTS "Figures";

CREATE TABLE IF NOT EXISTS "Figures" (
	"id"	INTEGER NOT NULL UNIQUE,
	"description"	VARCHAR NOT NULL UNIQUE,
	"color"	VARCHAR NULL,
	"other_attributes"	INTEGER NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);

DROP TABLE IF EXISTS [Event];

CREATE TABLE IF NOT EXISTS [Event] (
     "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
     "direction" DECIMAL NULL, 
     "center_coordinate" VARCHAR NULL, 
     "created" TIME NULL, 
     "visible" BOOLEAN NULL, 
     "f_id" INTEGER NOT NULL,
     FOREIGN KEY (f_id) REFERENCES [Figures](id)
);

DROP TABLE IF EXISTS "Project_has_Event";

CREATE TABLE IF NOT EXISTS "Project_has_Event" (
	"p_id"	INTEGER NOT NULL,
	"e_id"	INTEGER NOT NULL,
	PRIMARY KEY ("p_id", "e_id"),
	FOREIGN KEY("p_id") REFERENCES [Project](id),
	FOREIGN KEY("e_id") REFERENCES [Event](id)
);
