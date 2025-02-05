-- Ans no 1 :  Creating table name "Developers"

-- SQL Query : 
CREATE TABLE Developers 
(
member_id INT, 
name VARCHAR(30), 
email VARCHAR(30), 
influence_count INT, 
Joining_date date, 
multiplier INT 
);



-- SQL Query : 
DESCRIBE Developers; 



-- SQL Query : 
INSERT INTO Developers (member_id, name, email, influence_count, joining_date, multiplier) VALUES
(1, 'Taylor Otwell', 'otwell@laravel.com', 739360, '2020-06-10', 10),
(2, 'Ryan Dahl', 'ryan@nodejs.org', 633632, '2020-04-22', 10),
(3, 'Brendan Eich', 'eich@javascript.com', 939570, '2020-05-07', 8),
(4, 'Evan You', 'you@vuejs.org', 982630, '2020-06-11', 7),
(5, 'Rasmus Lerdorf', 'lerdorf@php.net', 937927, '2020-06-03', 8),
(6, 'Guido van Rossum', 'guido@python.org', 968827, '2020-07-18', 19),
(7, 'Adrian Holovaty', 'adrian@djangoproject.com', 570724, '2020-05-07', 5),
(8, 'Simon Willison', 'simon@djangoproject.com', 864615, '2020-04-30', 4),
(9, 'James Gosling', 'james@java.com', 719491, '2020-05-18', 5),
(10, 'Rod Johnson', 'rod@spring.io', 601744, '2020-05-18', 7),
(11, 'Satoshi Nakamoto', 'nakamoto@blockchain.com', 630488, '2020-05-10', 10);



-- SQL Query : 
SELECT * FROM Developers;



-- Ans no 2 :  Changing column name from “influence_count” to “followers” and data type INT

-- SQL Query : 
ALTER TABLE Developers CHANGE COLUMN influence_count followers INT;



-- Ans no 3 :  Updating number of followers of each developers +10
-- SQL Query : 
UPDATE Developers SET followers = followers + 10;



-- Ans no 4 :  Efficiency of developers with formula  Efficiency = ((followers*100/1000000) * (multipliers*100/20))/100.

-- SQL Query : 
SELECT name, (followers / 1000000.0) * (multiplier / 20.0) AS Efficiency FROM Developers;




-- Ans no 5 :  Showing name of the developers in UpperCase and the descending order of their Joining_date

-- SQL Query : 
SELECT UPPER(name) AS Uppercase_Name, joining_date FROM Developers ORDER BY joining_date DESC;



-- Ans no 6 :  Retrieving the member_id ,name and followers of the developers who have either “.com” or “.net” in their email address

-- SQL Query : 
SELECT member_id, name, email, followers FROM developers WHERE email LIKE '%.com%' OR email LIKE '%.net%';
