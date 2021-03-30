
INSERT INTO Users (openid, email)
                VALUES ("openid", "email@email.com");
            
INSERT INTO Session (openid) 
                VALUES ("openid");

INSERT INTO Event (direction, center_coordinate, image_size_when_created, created, f_id)
	VALUES (45,"12991.29291 2929.21", "[750, 900]", "12:12:12", 49);

INSERT INTO Project (name, description, screenshot, map, startdate, enddate, originalsize, zoom, u_id) 
              VALUES ("prosjektnamn", "beskrivelse", "screenshot", "kartet", "1998,1,30,12,23,43","1998,1,30,12,23,43",10, "zoom", 1);

INSERT INTO Figures 
                (description, color, image, other_attributes)
                VALUES ("beskrivelse","blue", "bilde", "attributter");

INSERT INTO Project_has_Event 
              (p_id, e_id) 
              VALUES (1,1);