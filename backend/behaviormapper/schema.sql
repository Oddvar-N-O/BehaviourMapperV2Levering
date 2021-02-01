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
	"description"	VARCHAR NOT NULL,
	"color"	VARCHAR NULL,
    "image" VARCHAR NOT NULL,
	"other_attributes"	INTEGER NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);

DROP TABLE IF EXISTS [Event];

CREATE TABLE IF NOT EXISTS [Event] (
     "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
     "direction" DECIMAL NULL, 
     "center_coordinate" VARCHAR NULL, 
     "created" TIME NULL,  
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

INSERT INTO 'Figures' ("description", "color", "image") VALUES 
    ('bike','blue', './icons/man/bike.png'),
    ('feedingBirds','blue', './icons/man/feedingBirds.png'),
    ('goodsDelivery','blue', './icons/man/goodsDelivery.png'),
    ('scooter','blue', './icons/man/scooter.png'),
    ('sit','blue', './icons/man/sit.png'),
    ('skateboard','blue', './icons/man/skateboard.png'),
    ('stand','blue', './icons/man/stand.png'),
    ('stop','blue', './icons/man/stop.png'),
    ('talk','blue', './icons/man/talk.png'),
    ('talkPhone','blue', './icons/man/talkPhone.png'),
    ('vehicle','blue', './icons/man/vehicle.png'),
    ('walk','blue', './icons/man/walk.png'),
    ('walkWithChildren','blue', './icons/man/walkWithChildren.png'),
    ('walkWithDog','blue', './icons/man/walkWithDog.png'),
    ('walkWithPram','blue', './icons/man/walkWithPram.png'),
    ('wheelchair','blue', './icons/man/wheelchair.png'),
    ('workers','blue', './icons/man/workers.png'),
    ('bike','red', './icons/woman/bike.png'),
    ('feedingBirds','red', './icons/woman/feedingBirds.png'),
    ('goodsDelivery','red', './icons/woman/goodsDelivery.png'),
    ('scooter','red', './icons/woman/scooter.png'),
    ('sit','red', './icons/woman/sit.png'),
    ('skateboard','red', './icons/woman/skateboard.png'),
    ('stand','red', './icons/woman/stand.png'),
    ('stop','red', './icons/woman/stop.png'),
    ('talk','red', './icons/woman/talk.png'),
    ('talkPhone','red', './icons/woman/talkPhone.png'),
    ('vehicle','red', './icons/woman/vehicle.png'),
    ('walk','red', './icons/woman/walk.png'),
    ('walkWithChildren','red', './icons/woman/walkWithChildren.png'),
    ('walkWithDog','red', './icons/woman/walkWithDog.png'),
    ('walkWithPram','red', './icons/woman/walkWithPram.png'),
    ('wheelchair','red', './icons/woman/wheelchair.png'),
    ('workers','red', './icons/woman/workers.png'),
    ('bike','green', './icons/child/bike.png'),
    ('feedingBirds','green', './icons/child/feedingBirds.png'),
    ('goodsDelivery','green', './icons/child/goodsDelivery.png'),
    ('scooter','green', './icons/child/scooter.png'),
    ('sit','green', './icons/child/sit.png'),
    ('skateboard','green', './icons/child/skateboard.png'),
    ('stand','green', './icons/child/stand.png'),
    ('stop','green', './icons/child/stop.png'),
    ('talk','green', './icons/child/talk.png'),
    ('talkPhone','green', './icons/child/talkPhone.png'),
    ('vehicle','green', './icons/child/vehicle.png'),
    ('walk','green', './icons/child/walk.png'),
    ('walkWithChildren','green', './icons/child/walkWithChildren.png'),
    ('walkWithDog','green', './icons/child/walkWithDog.png'),
    ('walkWithPram','green', './icons/child/walkWithPram.png'),
    ('wheelchair','green', './icons/child/wheelchair.png'),
    ('workers','green', './icons/child/workers.png');
