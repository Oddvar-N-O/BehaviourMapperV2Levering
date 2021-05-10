DROP TABLE IF EXISTS "Users" ;

CREATE TABLE IF NOT EXISTS "Users" (
	"openid"    VARCHAR NULL UNIQUE,
    "email" VARCHAR NULL,
	PRIMARY KEY("openid")
);

DROP TABLE IF EXISTS [Project];

CREATE TABLE IF NOT EXISTS [Project] (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR NOT NULL,
    description VARCHAR NULL,
    map VARCHAR NULL,
    screenshot VARCHAR NULL,
    startdate DATETIME NULL,
    enddate DATETIME NULL,
    originalsize VARCHAR NULL,
    zoom VARCHAR NULL,
    leftX VARCHAR NULL,
    lowerY VARCHAR NULL,
    rightX VARCHAR NULL,
    upperY VARCHAR NULL,
    u_id INTEGER,
    FOREIGN KEY (u_id) REFERENCES "Users"(openid)
);

DROP TABLE IF EXISTS "InterviewFigures";

CREATE TABLE IF NOT EXISTS "InterviewFigures" (
	"id"	INTEGER NOT NULL UNIQUE,
    "points" VARCHAR NULL,
    "color" VARCHAR NULL,
    "image_size_when_created" VARCHAR NULL,
    "type" VARCHAR NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);

DROP TABLE IF EXISTS "Interview_has_Figures";

CREATE TABLE IF NOT EXISTS "Interview_has_Figures" (
	"ie_id"	INTEGER NOT NULL,
	"if_id"	INTEGER NOT NULL,
	PRIMARY KEY ("ie_id", "if_id"),
	FOREIGN KEY("ie_id") REFERENCES [InterviewEvents](id),
	FOREIGN KEY("if_id") REFERENCES [InterviewFigures](id)
); 

DROP TABLE IF EXISTS "InterviewEvents";

CREATE TABLE IF NOT EXISTS "InterviewEvents" (
	"id"	INTEGER NOT NULL UNIQUE,
	"interview"	VARCHAR NULL,
    "figures" INTEGER NULL,
	"p_id"	INTEGER NOT NULL,
    FOREIGN KEY (p_id) REFERENCES "Project"(id)
    FOREIGN KEY (figures) REFERENCES 'InterviewFigures'(id)
	PRIMARY KEY("id" AUTOINCREMENT)
);

DROP TABLE IF EXISTS "Figures";

CREATE TABLE IF NOT EXISTS "Figures" (
	"id"	INTEGER NOT NULL UNIQUE,
	"description"	VARCHAR NOT NULL,
    "descriptionNO"	VARCHAR NOT NULL,
	"color"	VARCHAR NULL,
    "image" VARCHAR NOT NULL,
	"other_attributes"	INTEGER NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);

DROP TABLE IF EXISTS [Event];

CREATE TABLE IF NOT EXISTS [Event] (
     "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
     "action" VARCHAR NULL,
     "group_name" VARCHAR NULL, 
     "direction" DECIMAL NULL, 
     "center_coordinate" VARCHAR NULL,
     "image_size_when_created" VARCHAR NULL, 
     "created" TIME NULL,
     "comment" VARCHAR NULL,  
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

INSERT INTO 'Figures' ("description", "descriptionNO", "color", "image") VALUES 
    ('walk','gå','blue', './icons/man/walk.png'),
    ('bike','sykkel','blue', './icons/man/bike.png'),
    ('feeding birds','mate fugler','blue', './icons/man/feedingBirds.png'),
    ('scooter','sparkesykkel','blue', './icons/man/scooter.png'),
    ('sit','sitte','blue', './icons/man/sit.png'),
    ('skateboard','rullebrett','blue', './icons/man/skateboard.png'),
    ('stand','stå','blue', './icons/man/stand.png'),
    ('stop','stoppe','blue', './icons/man/stop.png'),
    ('talk','snakke','blue', './icons/man/talk.png'),
    ('talking in phone','snakke i telefon','blue', './icons/man/talkPhone.png'),
    ('vehicle','kjøretøy','blue', './icons/man/vehicle.png'),
    ('walk with dog','gå med hund','blue', './icons/man/walkWithDog.png'),
    ('walk with pram','gå med barnevogn','blue', './icons/man/walkWithPram.png'),
    ('wheelchair','rullestol','blue', './icons/man/wheelchair.png'),
    ('workers','arbeidere','blue', './icons/man/workers.png'),
    ('other','annet','blue', './icons/man/other.png'),
    ('walk','gå','red', './icons/woman/walk.png'),
    ('bike','sykkel','red', './icons/woman/bike.png'),
    ('feeding birds','mate fugler','red', './icons/woman/feedingBirds.png'),
    ('scooter','sparkesykkel','red', './icons/woman/scooter.png'),
    ('sit','sitte','red', './icons/woman/sit.png'),
    ('skateboard','rullebrett','red', './icons/woman/skateboard.png'),
    ('stand','stå','red', './icons/woman/stand.png'),
    ('stop','stoppe','red', './icons/woman/stop.png'),
    ('talk','snakke','red', './icons/woman/talk.png'),
    ('talking in phone','snakke i telefon','red', './icons/woman/talkPhone.png'),
    ('vehicle','kjøretøy','red', './icons/woman/vehicle.png'),
    ('walk with dog','gå med hund','red', './icons/woman/walkWithDog.png'),
    ('walk with pram','gå med barnevogn','red', './icons/woman/walkWithPram.png'),
    ('wheelchair','rullestol','red', './icons/woman/wheelchair.png'),
    ('workers','arbeidere','red', './icons/woman/workers.png'),
    ('other','annet','red', './icons/woman/other.png'),
    ('walk','gå','green', './icons/child/walk.png'),
    ('bike','sykkel','green', './icons/child/bike.png'),
    ('feeding birds','mate fugler','green', './icons/child/feedingBirds.png'),
    ('scooter','sparkesykkel','green', './icons/child/scooter.png'),
    ('sit','sitte','green', './icons/child/sit.png'),
    ('skateboard','rullebrett','green', './icons/child/skateboard.png'),
    ('stand','stå','green', './icons/child/stand.png'),
    ('stop','stoppe','green', './icons/child/stop.png'),
    ('talk','snakke','green', './icons/child/talk.png'),
    ('talking in phone','snakke i telefon','green', './icons/child/talkPhone.png'),
    ('wheelchair','rullestol','green', './icons/child/wheelchair.png'),
    ('other','annet','green', './icons/child/other.png'),
    ('standing still','i ro','yellow', './icons/group/groupStill.png'),
    ('moving','i bevegelse','yellow', './icons/group/groupMoving.png'),
    ('other','annet','yellow', './icons/group/other.png'),
    ('other','annet','yellow', './icons/group/other.png');
