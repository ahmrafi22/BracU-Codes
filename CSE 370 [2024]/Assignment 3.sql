
-- Ans no 1 :  Find the name and loan number of all customers having a loan at the Downtown branch.

-- SQL Query : 
SELECT c.customer_name, l.loan_number
FROM customer c, borrower b, loan l
WHERE c.customer_id = b.customer_id
  AND b.loan_number = l.loan_number
  AND l.branch_name = 'Downtown';






-- Ans no 2 :  Find all the possible pairs of customers who are from the same city. show in the format Customer1, Customer2, City.

-- SQL Query : 
SELECT c1.customer_name AS Customer1, 
       c2.customer_name AS Customer2, 
       c1.customer_city AS City
FROM customer c1, customer c2
WHERE c1.customer_city = c2.customer_city
  AND c1.customer_name < c2.customer_name
ORDER BY c1.customer_city, c1.customer_name, c2.customer_name;




-- Ans no 3:  If the bank gives out 4% interest to all accounts, show the total interest across each branch. Print Branch_name, Total_Interest

-- SQL Query : 
SELECT a.branch_name, 
       SUM(a.balance * 0.04) AS Total_Interest
FROM account a
GROUP BY a.branch_name
ORDER BY a.branch_name;





-- Ans no 4 :  Find account numbers with the highest balances for each city in the database

-- SQL Query : 
SELECT b.branch_city, a.account_number, a.balance
FROM account a
JOIN branch b ON a.branch_name = b.branch_name
WHERE (b.branch_city, a.balance) IN (
    SELECT b2.branch_city, MAX(a2.balance)
    FROM account a2
    JOIN branch b2 ON a2.branch_name = b2.branch_name
    GROUP BY b2.branch_city
)
ORDER BY b.branch_city;






-- Ans no 5 :  Show the loan number, loan amount, and name of customers with the top 5 highest loan amounts. The data should be sorted by increasing amounts, then decreasing loan numbers in case of the same loan amount. 

-- SQL Query : 
SELECT l.loan_number, l.amount, c.customer_name
FROM loan l
JOIN borrower b ON l.loan_number = b.loan_number
JOIN customer c ON b.customer_id = c.customer_id
ORDER BY l.amount DESC, l.loan_number DESC
LIMIT 5;








-- Ans no 6 :  Find the names of customers with an account and also a loan at the Perryridge branch.


-- SQL Query : 
SELECT DISTINCT c.customer_name
FROM customer c
JOIN depositor d ON c.customer_id = d.customer_id
JOIN account a ON d.account_number = a.account_number
JOIN borrower b ON c.customer_id = b.customer_id
JOIN loan l ON b.loan_number = l.loan_number
WHERE a.branch_name = 'Perryridge'
  AND l.branch_name = 'Perryridge';
D





-- Ans no 7 :  Find the total loan amount of all customers having at least 2 loans from the bank. Show in format customer name, total_loan


-- SQL Query : 
SELECT c.customer_name, SUM(l.amount) AS total_loan
FROM customer c
JOIN borrower b ON c.customer_id = b.customer_id
JOIN loan l ON b.loan_number = l.loan_number
GROUP BY c.customer_id, c.customer_name
HAVING COUNT(DISTINCT l.loan_number) >= 2
ORDER BY total_loan DESC;
