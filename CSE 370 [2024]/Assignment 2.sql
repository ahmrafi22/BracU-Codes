-- Creating table name "Employee"

-- SQL Query : 
CREATE TABLE Employee ( 
employee_id char(10), 
first_name varchar(20), 
last_name varchar(20), 
email varchar(60), 
phone_number char(14), 
hire_date date, 
job_id char(10), 
salary int, 
commission_pct decimal(5,3), 
manager_id char(10), 
department_id char(10) 
); 

DESCRIBE Employee; 



-- Inserting Data: 

INSERT INTO Employee VALUES
('EMP001', 'Mario', 'Bros', 'mario.bros@gmail.com', '1723456789', '1985-09-13', 'JOB001', 55000, 0.052, 'MNG001', 'DPT001'),
('EMP002', 'Lara', 'Croft', 'lara.croft@gmail.com', '1734567890', '1996-10-25', 'JOB002', 62000, 0.031, 'MNG001', 'DPT001'),
('EMP003', 'Geralt', 'Rivia', 'geralt.rivia@gmail.com', '1745678901', '1993-05-17', 'JOB003', 57000, 0.058, 'MNG001', 'DPT002'),
('EMP004', 'Ellie', 'Williams', 'ellie.williams@gmail.com', '1756789012', '2013-06-14', 'JOB001', 53000, 0.043, 'MNG002', 'DPT002'),
('EMP005', 'Nathan', 'Drake', 'nathan.drake@yahoo.com', '1767890123', '2007-11-19', 'JOB004', 59000, 0.067, 'MNG002', 'DPT003'),
('EMP006', 'Samus', 'Aran', 'samus.aran@yahoo.com', '1778901234', '1986-08-06', 'JOB002', 61000, 0.055, 'MNG002', 'DPT004'),
('EMP007', 'Link', 'Hyrule', 'link.hyrule@gmail.com', '1789012345', '1986-02-21', 'JOB005', 54000, 0.036, 'MNG003', 'DPT004'),
('EMP008', 'Ripley', 'Ellen', 'ripley.ellen@yahoo.com', '1790123456', '1979-05-25', 'JOB006', 26000, 0.059, 'MNG003', 'DPT005'),
('EMP009', 'Cloud', 'Strife', 'cloud.strife@gmail.com', '1701234567', '1997-01-31', 'JOB003', 16000, 0.044, 'MNG004', 'DPT006'),
('EMP010', 'Aloy', 'Nora', 'aloy.nora@gmail.com', '1712345678', '2017-02-28', 'JOB004', 60000, 0.051, 'MNG004', 'DPT007');



SELECT * FROM Developers;



-- Ans no 1 :  Find the first_name, last_name, email, phone_number, hire_date and department_id of all the employees with the latest hire_date.

-- SQL Query : 
SELECT first_name, last_name, email, phone_number, hire_date, department_id 
FROM Employee 
  WHERE hire_date = (SELECT MAX(hire_date) FROM Employee);





-- Ans no 2 :  Find the first_name, last_name, employee_id, phone_number, salary and department_id of all the employees with the lowest salary in each department.

-- SQL Query : 
SELECT first_name, last_name, employee_id, phone_number, salary, department_id
FROM Employee 
WHERE (department_id, salary) IN (
    SELECT department_id, MIN(salary) 
    FROM Employee 
    GROUP BY department_id
);



-- Ans no 3:  Find the first_name, last_name, employee_id, commission_pct and department_id of all the employees in the department 'DPT007' who have a lower commission_pct than all of the department 'DPT005' employees.

-- SQL Query : 
SELECT first_name, last_name, employee_id, commission_pct, department_id
FROM Employee
WHERE department_id = 'DPT007'
  AND commission_pct < (
    SELECT MIN(commission_pct)
    FROM Employee
    WHERE department_id = 'DPT005'
  );




-- Ans no 4 :  Find the department_id and total number of employees of each department which does not have a single employee under it with a salary more than 30,000.

-- SQL Query : 
SELECT department_id, COUNT(*) as employee_count
FROM Employee
WHERE department_id NOT IN (
    SELECT DISTINCT department_id
    FROM Employee
    WHERE salary > 30000
)
GROUP BY department_id;




-- Ans no 5 :  For each department, find the department_id, job_id and commission_pct with commission_pct less than at least one other job_id in that department.

-- SQL Query : 
SELECT department_id, job_id, commission_pct 
FROM Employee l1 
WHERE commission_pct < ANY (
    SELECT commission_pct 
    FROM Employee l2 
    WHERE l1.department_id = l2.department_id 
      AND l1.job_id != l2.job_id
);







-- Ans no 6 :  Find the manager_id who does not have any employee under them with a salary less than 3500.


-- SQL Query : 
SELECT manager_id
FROM Employee
GROUP BY manager_id
HAVING MIN(salary) >= 3500
AND manager_id IS NOT NULL;





-- Ans no 7 :  Find the first_name, last_name, employee_id, email, salary, department_id and commission_pct of the employee with the lowest commission_pct under each manager.


-- SQL Query : 
SELECT first_name, last_name, employee_id, email, salary, department_id, commission_pct
FROM Employee e
WHERE (manager_id, commission_pct) IN (
    SELECT manager_id, MIN(commission_pct)
    FROM Employee
    GROUP BY manager_id
);
