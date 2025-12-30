-- Mechanics table
CREATE TABLE mechanics (
    mechanic_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    max_daily_appointments INT DEFAULT 4,
    image_path VARCHAR(255) DEFAULT 'assets/mechanic_X.png'
);

-- Clients table
CREATE TABLE clients (
    client_id INT PRIMARY KEY AUTO_INCREMENT,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL
);

-- Cars table
CREATE TABLE cars (
    car_id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    car_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(20) NOT NULL,
    engine_number VARCHAR(20) NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(client_id)
);

-- Appointments table with specific time slot
CREATE TABLE appointments (
    appointment_id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    car_id INT NOT NULL,
    mechanic_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot TIME NOT NULL,
    appointment_status ENUM('pending', 'scheduled', 'in_progress', 'completed') DEFAULT 'pending',
    appointment_reason TEXT,
    FOREIGN KEY (client_id) REFERENCES clients(client_id),
    FOREIGN KEY (car_id) REFERENCES cars(car_id),
    FOREIGN KEY (mechanic_id) REFERENCES mechanics(mechanic_id),
    UNIQUE (client_id, appointment_date),
    UNIQUE (mechanic_id, appointment_date, time_slot)
);

-- Admin table
CREATE TABLE admin (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- add random 
INSERT INTO mechanics (name, max_daily_appointments, image_path) 
VALUES
    ('Lex Luthor', 4, 'assets/mechanic (1).png'),
    ('Reverse Flash', 4, 'assets/mechanic (2).png'),
    ('Sinestro', 4, 'assets/mechanic (3).png'),
    ('Deathstroke', 4, 'assets/mechanic (4).png'),
    ('Harley Quinn', 4, 'assets/mechanic (5).png');

INSERT INTO clients (password_hash, name, phone, email, address) 
VALUES
    ('$2y$10$BK7Qk7nxcpQBJUWgw4O7yOAsV1OlvV9s/MT7Ce.U58qybnbywxGom', 'Phoenix', '3051234567', 'phoenix@gmail.com', '123 Valorant St, Miami, FL'),
    ('$2y$10$BK7Qk7nxcpQBJUWgw4O7yOAsV1OlvV9s/MT7Ce.U58qybnbywxGom', 'Jett', '7869876543', 'jett@gmail.com', '456 Breeze Ave, Orlando, FL'),
    ('$2y$10$BK7Qk7nxcpQBJUWgw4O7yOAsV1OlvV9s/MT7Ce.U58qybnbywxGom', 'Sage', '9047654321', 'sage@gmail.com', '789 Icebox Blvd, Jacksonville, FL'),
    ('$2y$10$BK7Qk7nxcpQBJUWgw4O7yOAsV1OlvV9s/MT7Ce.U58qybnbywxGom', 'Omen', '8133456789', 'omen@gmail.com', '321 Split Ln, Tampa, FL'),
    ('$2y$10$BK7Qk7nxcpQBJUWgw4O7yOAsV1OlvV9s/MT7Ce.U58qybnbywxGom', 'Reyna', '7272345678', 'reyna@gmail.com', '654 Haven Rd, St. Petersburg, FL'),
    ('$2y$10$BK7Qk7nxcpQBJUWgw4O7yOAsV1OlvV9s/MT7Ce.U58qybnbywxGom', 'Killjoy', '4079871234', 'killjoy@gmail.com', '987 Bind Dr, Orlando, FL'),
    ('$2y$10$BK7Qk7nxcpQBJUWgw4O7yOAsV1OlvV9s/MT7Ce.U58qybnbywxGom', 'Breach', '8501237890', 'breach@gmail.com', '159 Pearl Ave, Tallahassee, FL'),
    ('$2y$10$BK7Qk7nxcpQBJUWgw4O7yOAsV1OlvV9s/MT7Ce.U58qybnbywxGom', 'Cypher', '5618765432', 'cypher@gmail.com', '753 Ascent Ct, Boca Raton, FL'),
    ('$2y$10$BK7Qk7nxcpQBJUWgw4O7yOAsV1OlvV9s/MT7Ce.U58qybnbywxGom', 'Sova', '7724567890', 'sova@gmail.com', '369 Fracture Way, Port St. Lucie, FL'),
    ('$2y$10$BK7Qk7nxcpQBJUWgw4O7yOAsV1OlvV9s/MT7Ce.U58qybnbywxGom', 'Brimstone', '9545678901', 'brimstone@gmail.com', '951 Agency Rd, Fort Lauderdale, FL');


INSERT INTO cars (client_id, car_name, license_number, engine_number) 
VALUES
    (1, 'Toyota Camry', 'FL12345A', 'ENG987654321'),
    (2, 'Honda Accord', 'FL23456B', 'ENG876543210'),
    (3, 'Ford Fusion', 'FL34567C', 'ENG765432109'),
    (4, 'Nissan Altima', 'FL45678D', 'ENG654321098'),
    (5, 'Chevrolet Malibu', 'FL56789E', 'ENG543210987'),
    (6, 'Hyundai Sonata', 'FL67890F', 'ENG432109876'),
    (7, 'Kia Optima', 'FL78901G', 'ENG321098765'),
    (8, 'Mazda 6', 'FL89012H', 'ENG210987654'),
    (9, 'Volkswagen Passat', 'FL90123I', 'ENG109876543'),
    (10, 'Subaru Legacy', 'FL01234J', 'ENG098765432');



-- Appointments for 21st December 2024
INSERT INTO appointments (client_id, car_id, mechanic_id, appointment_date, time_slot, appointment_status, appointment_reason)
VALUES
    (1, 1, 1, '2024-12-21', '10:00:00', 'pending', 'Oil change'),
    (2, 2, 2, '2024-12-21', '12:00:00', 'pending', 'Brake inspection'),
    (4, 4, 4, '2024-12-21', '10:00:00', 'pending', 'Engine check'),
    (5, 5, 5, '2024-12-21', '12:00:00', 'pending', 'Battery replacement'),
    (6, 6, 1, '2024-12-21', '14:00:00', 'pending', 'Transmission repair'),
    (7, 7, 2, '2024-12-21', '10:00:00', 'pending', 'Suspension repair'),
    (8, 8, 3, '2024-12-21', '12:00:00', 'pending', 'Clutch replacement'),
    (9, 9, 4, '2024-12-21', '14:00:00', 'pending', 'Air conditioning repair'),
    (10, 10, 5, '2024-12-21', '10:00:00', 'pending', 'Oil change');

-- Appointments for 23rd December 2024
INSERT INTO appointments (client_id, car_id, mechanic_id, appointment_date, time_slot, appointment_status, appointment_reason)
VALUES
    (1, 1, 2, '2024-12-23', '10:00:00', 'pending', 'Oil change'),
    (2, 2, 3, '2024-12-23', '12:00:00', 'pending', 'Brake inspection'),
    (3, 3, 4, '2024-12-23', '14:00:00', 'pending', 'Tire replacement'),
    (4, 4, 5, '2024-12-23', '10:00:00', 'pending', 'Engine check'),
    (5, 5, 1, '2024-12-23', '12:00:00', 'pending', 'Battery replacement'),
    (6, 6, 2, '2024-12-23', '14:00:00', 'pending', 'Transmission repair'),
    (7, 7, 3, '2024-12-23', '10:00:00', 'pending', 'Suspension repair'),
    (8, 8, 4, '2024-12-23', '12:00:00', 'pending', 'Clutch replacement'),
    (9, 9, 5, '2024-12-23', '14:00:00', 'pending', 'Air conditioning repair'),
    (10, 10, 1, '2024-12-23', '10:00:00', 'pending', 'Oil change');

-- Appointments for 24th December 2024
INSERT INTO appointments (client_id, car_id, mechanic_id, appointment_date, time_slot, appointment_status, appointment_reason)
VALUES
    (1, 1, 1, '2024-12-24', '10:00:00', 'pending', 'Oil change'),
    (2, 2, 2, '2024-12-24', '12:00:00', 'pending', 'Brake inspection'),
    (4, 4, 4, '2024-12-24', '10:00:00', 'pending', 'Engine check'),
    (5, 5, 5, '2024-12-24', '12:00:00', 'pending', 'Battery replacement'),
    (6, 6, 1, '2024-12-24', '14:00:00', 'pending', 'Transmission repair'),
    (7, 7, 2, '2024-12-24', '10:00:00', 'pending', 'Suspension repair'),
    (8, 8, 3, '2024-12-24', '12:00:00', 'pending', 'Clutch replacement'),
    (9, 9, 4, '2024-12-24', '14:00:00', 'pending', 'Air conditioning repair'),
    (10, 10, 5, '2024-12-24', '10:00:00', 'pending', 'Oil change');

-- Appointments for 25th December 2024
INSERT INTO appointments (client_id, car_id, mechanic_id, appointment_date, time_slot, appointment_status, appointment_reason)
VALUES
    (1, 1, 2, '2024-12-25', '10:00:00', 'pending', 'Oil change'),
    (2, 2, 3, '2024-12-25', '12:00:00', 'pending', 'Brake inspection'),
    (3, 3, 4, '2024-12-25', '14:00:00', 'pending', 'Tire replacement'),
    (4, 4, 5, '2024-12-25', '10:00:00', 'pending', 'Engine check'),
    (5, 5, 1, '2024-12-25', '12:00:00', 'pending', 'Battery replacement'),
    (6, 6, 2, '2024-12-25', '14:00:00', 'pending', 'Transmission repair'),
    (7, 7, 3, '2024-12-25', '10:00:00', 'pending', 'Suspension repair'),
    (8, 8, 4, '2024-12-25', '12:00:00', 'pending', 'Clutch replacement'),
    (9, 9, 5, '2024-12-25', '14:00:00', 'pending', 'Air conditioning repair'),
    (10, 10, 1, '2024-12-25', '10:00:00', 'pending', 'Oil change');





--  admin with password hash admin_main , admin_m11
INSERT INTO admin (username, password_hash)
VALUES ('admin_main', '$2y$10$cfwrYOUQUBih5mVRIde3w.fb5X94nQzrMCMC53wxP.W.ovdnJQXiu');
