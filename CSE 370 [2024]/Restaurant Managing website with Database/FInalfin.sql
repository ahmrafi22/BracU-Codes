CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

-- Menu items table
CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(255)
);

-- Orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    menu_item_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);
-- Tables table
CREATE TABLE tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_number INT NOT NULL UNIQUE,
    capacity INT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE
);

-- Table reservations
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    table_number INT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    number_of_people INT NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comment TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);




-- Reviews table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Inventory table
CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(20) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- staff table 
CREATE TABLE  staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserting an admin user
INSERT INTO staff (username, password, is_admin) 
VALUES ('admin', '$2y$10$8IrpApOcCe8upGCEfMECKea782ZjQpTCHhDWwg1AAkWpYCZwYCae2', TRUE);
-- user id : admin pass : admin123



INSERT INTO users (username, password, name, phone_number, email) VALUES
('rafi_ahmed123', '$2y$10$m2bOguhbEQgVHXn1LDklJOKlL3843WbAIDm3ciUrkjrIlYNmjb8ma', 'Rafi Ahmed', '01711111111', 'rafi.ahmed@example.com'),
('nahiyan_khan456', '$2y$10$m2bOguhbEQgVHXn1LDklJOKlL3843WbAIDm3ciUrkjrIlYNmjb8ma', 'Nahiyan Khan', '01722222222', 'nahiyan.khan@example.com'),
('khan_mahi789', '$2y$10$m2bOguhbEQgVHXn1LDklJOKlL3843WbAIDm3ciUrkjrIlYNmjb8ma', 'Khan Mahi Mahi', '01733333333', 'khan.mahi@example.com'),
('tanvir_hossain012', '$2y$10$m2bOguhbEQgVHXn1LDklJOKlL3843WbAIDm3ciUrkjrIlYNmjb8ma', 'Tanvir Hossain', '01744444444', 'tanvir.hossain@example.com'),
('nusrat_jahan345', '$2y$10$m2bOguhbEQgVHXn1LDklJOKlL3843WbAIDm3ciUrkjrIlYNmjb8ma', 'Nusrat Jahan', '01755555555', 'nusrat.jahan@example.com'),
('sadia_afrin678', '$2y$10$m2bOguhbEQgVHXn1LDklJOKlL3843WbAIDm3ciUrkjrIlYNmjb8ma', 'Sadia Afrin', '01766666666', 'sadia.afrin@example.com'),
('mehedi_hasan901', '$2y$10$m2bOguhbEQgVHXn1LDklJOKlL3843WbAIDm3ciUrkjrIlYNmjb8ma', 'Mehedi Hasan', '01777777777', 'mehedi.hasan@example.com'),
('tasnim_tabassum234', '$2y$10$m2bOguhbEQgVHXn1LDklJOKlL3843WbAIDm3ciUrkjrIlYNmjb8ma', 'Tasnim Tabassum', '01788888888', 'tasnim.tabassum@example.com'),
('farhan_islam567', '$2y$10$m2bOguhbEQgVHXn1LDklJOKlL3843WbAIDm3ciUrkjrIlYNmjb8ma', 'Farhan Islam', '01799999999', 'farhan.islam@example.com'),
('nafisa_akter890', '$2y$10$m2bOguhbEQgVHXn1LDklJOKlL3843WbAIDm3ciUrkjrIlYNmjb8ma', 'Nafisa Akter', '01700000000', 'nafisa.akter@example.com'),
('rakib_hasan123', '$2y$10$m2bOguhbEQgVHXn1LDklJOKlL3843WbAIDm3ciUrkjrIlYNmjb8ma', 'Rakib Hasan', '01712345678', 'rakib.hasan@example.com'),
('sumaiya_islam456', '$2y$10$m2bOguhbEQgVHXn1LDklJOKlL3843WbAIDm3ciUrkjrIlYNmjb8ma', 'Sumaiya Islam', '01723456789', 'sumaiya.islam@example.com'),
('tamim_iqbal789', '$2y$10$m2bOguhbEQgVHXn1LDklJOKlL3843WbAIDm3ciUrkjrIlYNmjb8ma', 'Tamim Iqbal', '01734567890', 'tamim.iqbal@example.com'),
('naznin_nahar012', '$2y$10$m2bOguhbEQgVHXn1LDklJOKlL3843WbAIDm3ciUrkjrIlYNmjb8ma', 'Naznin Nahar', '01745678901', 'naznin.nahar@example.com'),
('shahriar_nafis345', '$2y$10$m2bOguhbEQgVHXn1LDklJOKlL3843WbAIDm3ciUrkjrIlYNmjb8ma', 'Shahriar Nafis', '01756789012', 'shahriar.nafis@example.com');



INSERT INTO `menu_items` (`id`, `name`, `description`, `price`, `category`, `image_url`) VALUES
(1, 'Beef Tacos', 'Juicy beef tacos with fresh toppings', 12.99, 'food', 'images/beef_tacos.jpg'),
(2, 'Burrito Bowl', 'A hearty bowl filled with rice, beans, and your choice of protein', 11.99, 'food', 'images/burrito_bowl.jpg'),
(3, 'Chicken Alfredo', 'Creamy Alfredo sauce with tender chicken over pasta', 14.99, 'food', 'images/chicken_alfredo.jpg'),
(4, 'French Onion Soup', 'Classic French onion soup with melted cheese', 8.99, 'food', 'images/french_onion_soup.jpg'),
(5, 'Margherita Pizza', 'Traditional Italian pizza with fresh mozzarella and basil', 13.99, 'food', 'images/margherita_pizza.jpg'),
(6, 'Pad Thai', 'Thai stir-fried rice noodles with shrimp and peanuts', 12.99, 'food', 'images/pad_thai.jpg'),
(7, 'Spaghetti Carbonara', 'Italian pasta dish with eggs, cheese, and pancetta', 13.99, 'food', 'images/spaghetti_carbonara.jpg'),
(8, 'Steak Frites', 'Juicy steak served with crispy french fries', 19.99, 'food', 'images/steak_frites.jpg'),
(9, 'Sushi Platter', 'Assorted sushi rolls and sashimi', 22.99, 'food', 'images/sushi_platter.jpg'),
(10, 'Tiramisu', 'Classic Italian coffee-flavored dessert', 7.99, 'food', 'images/tiramisu.jpg'),
(11, 'Tom Yum Soup', 'Spicy and sour Thai soup with shrimp', 9.99, 'food', 'images/tom_yum_soup.jpg'),
(12, 'Lemon Soda', 'Refreshing lemon-flavored soda', 2.99, 'drink', 'images/lemon_soda.jpg'),
(13, 'Sugar Free Coke', 'Sugar-free cola beverage', 2.49, 'drink', 'images/sugar_free_coke.jpg'),
(14, 'Original Coke', 'Classic cola beverage', 2.49, 'drink', 'images/original_coke.jpg'),
(15, 'Orange Juice', 'Freshly squeezed orange juice', 3.49, 'drink', 'images/orange_juice.jpg'),
(18, 'Apple juice', 'Cold sweet apple juice', 4.69, 'drink', 'images/apple.jpg'),
(19, 'Mango Juice', 'Fresh Mango Juice', 5.78,'drink','images/mango.jpg');


INSERT INTO orders (id, user_id, total_amount, status, created_at) VALUES 
(1, 1, 25.98, 'confirmed', '2024-09-21 10:00:00'),
(2, 2, 38.97, 'confirmed', '2024-09-21 10:15:00'),
(3, 3, 14.99, 'pending', '2024-09-21 10:30:00'),
(4, 4, 51.96, 'confirmed', '2024-09-21 10:45:00'),
(5, 5, 22.99, 'confirmed', '2024-09-21 11:00:00'),
(6, 6, 29.97, 'confirmed', '2024-09-21 11:15:00'),
(7, 7, 41.97, 'pending', '2024-09-21 11:30:00'),
(8, 8, 19.99, 'confirmed', '2024-09-21 11:45:00'),
(9, 9, 33.98, 'pending', '2024-09-21 12:00:00'),
(10, 10, 45.96, 'confirmed', '2024-09-21 12:15:00'),
(11, 11, 27.98, 'confirmed', '2024-09-21 12:30:00'),
(12, 12, 36.97, 'confirmed', '2024-09-21 12:45:00'),
(13, 13, 18.99, 'pending', '2024-09-21 13:00:00'),
(14, 14, 54.95, 'confirmed', '2024-09-21 13:15:00'),
(15, 15, 23.99, 'confirmed', '2024-09-21 13:30:00'),
(16, 1, 31.97, 'confirmed', '2024-09-21 13:45:00'),
(17, 2, 39.98, 'pending', '2024-09-21 14:00:00'),
(18, 3, 17.99, 'confirmed', '2024-09-20 14:15:00'),
(19, 4, 47.96, 'pending', '2024-09-20 14:30:00'),
(20, 5, 28.98, 'confirmed', '2024-09-20 14:45:00'),
(21, 6, 35.97, 'confirmed', '2024-09-20 15:00:00'),
(22, 7, 42.96, 'confirmed', '2024-09-20 15:15:00'),
(23, 8, 21.99, 'pending', '2024-09-20 15:30:00'),
(24, 9, 49.95, 'confirmed', '2024-09-20 15:45:00'),
(25, 10, 26.98, 'pending', '2024-09-20 16:00:00'),
(26, 11, 37.97, 'confirmed', '2024-09-20 16:15:00'),
(27, 12, 16.99, 'pending', '2024-09-20 16:30:00'),
(28, 13, 52.95, 'confirmed', '2024-09-19 16:45:00'),
(29, 14, 24.99, 'confirmed', '2024-09-19 17:00:00'),
(30, 15, 34.97, 'confirmed', '2024-09-19 17:15:00'),
(31, 1, 43.96, 'pending', '2024-09-19 17:30:00'),
(32, 2, 20.99, 'confirmed', '2024-09-19 17:45:00'),
(33, 3, 48.95, 'pending', '2024-09-19 18:00:00'),
(34, 4, 29.98, 'confirmed', '2024-09-19 18:15:00'),
(35, 5, 39.97, 'confirmed', '2024-09-19 18:30:00'),
(36, 6, 15.99, 'confirmed', '2024-09-19 18:45:00'),
(37, 7, 53.95, 'confirmed', '2024-09-19 19:00:00'),
(38, 8, 25.99, 'confirmed', '2024-09-19 19:15:00'),
(39, 9, 36.97, 'confirmed', '2024-09-19 19:30:00'),
(40, 10, 44.96, 'confirmed', '2024-09-18 19:45:00'),
(41, 11, 19.99, 'pending', '2024-09-18 20:00:00'),
(42, 12, 50.95, 'confirmed', '2024-09-18 20:15:00'),
(43, 13, 30.98, 'pending', '2024-09-18 20:30:00'),
(44, 14, 40.97, 'confirmed', '2024-09-18 20:45:00'),
(45, 15, 14.99, 'pending', '2024-09-18 21:00:00'),
(46, 1, 55.95, 'confirmed', '2024-09-18 21:15:00'),
(47, 2, 26.99, 'pending', '2024-09-18 21:30:00'),
(48, 3, 37.97, 'confirmed', '2024-09-18 21:45:00'),
(49, 4, 45.96, 'pending', '2024-09-18 22:00:00'),
(50, 5, 34.97, 'confirmed', '2024-09-18 22:15:00');



INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES
(1, 1, 2, 12.99),
(1, 12, 1, 2.99),
(2, 3, 2, 14.99),
(2, 13, 2, 2.49),
(3, 5, 1, 13.99),
(3, 14, 1, 2.49),
(4, 7, 3, 13.99),
(4, 15, 2, 3.49),
(5, 9, 1, 22.99),
(6, 2, 2, 11.99),
(6, 12, 2, 2.99),
(7, 4, 3, 8.99),
(7, 13, 3, 2.49),
(8, 6, 1, 12.99),
(8, 14, 2, 2.49),
(9, 8, 1, 19.99),
(9, 15, 2, 3.49),
(10, 10, 4, 7.99),
(10, 12, 3, 2.99),
(11, 1, 1, 12.99),
(11, 13, 3, 2.49),
(12, 3, 2, 14.99),
(12, 14, 2, 2.49),
(13, 5, 1, 13.99),
(13, 15, 1, 3.49),
(14, 7, 3, 13.99),
(14, 12, 3, 2.99),
(15, 9, 1, 22.99),
(16, 2, 2, 11.99),
(16, 13, 2, 2.49),
(17, 4, 3, 8.99),
(17, 14, 3, 2.49),
(18, 6, 1, 12.99),
(18, 15, 1, 3.49),
(19, 8, 2, 19.99),
(19, 12, 2, 2.99),
(20, 10, 3, 7.99),
(20, 13, 1, 2.49),
(21, 1, 2, 12.99),
(21, 14, 2, 2.49),
(22, 3, 2, 14.99),
(22, 15, 1, 3.49),
(23, 5, 1, 13.99),
(23, 12, 2, 2.99),
(24, 7, 3, 13.99),
(24, 13, 2, 2.49),
(25, 9, 1, 22.99),
(25, 14, 1, 2.49),
(26, 2, 2, 11.99),
(26, 15, 1, 3.49),
(27, 4, 2, 8.99),
(28, 6, 1, 12.99),
(28, 12, 1, 2.99),
(29, 8, 2, 19.99),
(29, 13, 2, 2.49),
(30, 10, 3, 7.99),
(30, 14, 3, 2.49),
(31, 1, 3, 12.99),
(31, 15, 1, 3.49),
(32, 3, 1, 14.99),
(32, 12, 2, 2.99),
(33, 5, 3, 13.99),
(33, 13, 2, 2.49),
(34, 7, 2, 13.99),
(35, 9, 1, 22.99),
(35, 14, 3, 2.49),
(36, 2, 1, 11.99),
(36, 15, 1, 3.49),
(37, 4, 4, 8.99),
(37, 12, 3, 2.99),
(38, 6, 2, 12.99),
(39, 8, 1, 19.99),
(39, 13, 3, 2.49),
(40, 10, 4, 7.99),
(40, 14, 2, 2.49),
(41, 1, 1, 12.99),
(41, 15, 2, 3.49),
(42, 3, 3, 14.99),
(43, 5, 2, 13.99),
(43, 12, 3, 2.99),
(44, 7, 2, 13.99),
(44, 13, 2, 2.49),
(45, 9, 1, 22.99),
(45, 14, 1, 2.49),
(46, 2, 3, 11.99),
(46, 15, 3, 3.49),
(47, 4, 2, 8.99),
(47, 12, 2, 2.99),
(48, 6, 2, 12.99),
(48, 13, 2, 2.49),
(49, 8, 1, 19.99),
(49, 14, 3, 2.49),
(50, 10, 4, 7.99),
(50, 15, 2, 3.49);



INSERT INTO `reviews` (`id`, `user_id`, `rating`, `comment`, `created_at`) VALUES
(1, 1, 5, 'The Beef Tacos were absolutely delightful! Juicy and packed with flavor, they had the perfect crunch from the fresh toppings. The ambiance is vibrant, making it a great spot for a casual night out.', '2024-09-20 10:00:00'),
(2, 2, 4, 'I ordered the Chicken Alfredo, and it was creamy and rich, just as I hoped. The pasta was cooked to perfection. The restaurant has a warm and inviting atmosphere, perfect for family dinners.', '2024-09-20 11:00:00'),
(3, 3, 4, 'The Margherita Pizza is a must-try! The fresh mozzarella and basil were heavenly. The only downside was a slight wait, but the cozy environment made it worth it.', '2024-09-20 12:00:00'),
(4, 4, 5, 'Loved the Sushi Platter! The variety was impressive, and everything tasted incredibly fresh. The decor was elegant, enhancing the dining experience.', '2024-09-20 13:00:00'),
(5, 5, 4, 'The Tiramisu was a perfect end to my meal. Light, fluffy, and not overly sweet. The ambiance is lovely, making it a perfect date night spot.', '2024-09-20 14:00:00'),
(6, 6, 4, 'I enjoyed the Pad Thai! The shrimp were cooked perfectly, and the flavors were spot on. The staff were friendly, and the setting was cozy.', '2024-09-20 15:00:00'),
(7, 7, 5, 'Steak Frites were incredible! The steak was cooked to my liking and paired beautifully with the crispy fries. The atmosphere was lively, making it a fun night out.', '2024-09-20 16:00:00'),
(9, 9, 5, 'Had a fantastic meal with the Spaghetti Carbonara! The pancetta added a nice touch, and the creamy sauce was delectable. The ambiance is perfect for any occasion.', '2024-09-20 18:00:00'),
(10, 10, 4, 'The Lemon Soda was a refreshing start to my meal! It was zesty and not overly sweet. The restaurant’s design was modern and appealing.', '2024-09-20 19:00:00'),
(11, 12, 5, 'The Tom Yum Soup was bursting with flavor! It was the perfect blend of spicy and sour. The restaurant’s cozy atmosphere made it a great place to unwind.', '2024-09-20 20:00:00'),
(12, 12, 4, 'I tried the Burrito Bowl, and it was satisfying and flavorful! The environment was vibrant, and the service was quick and friendly.', '2024-09-20 21:00:00'),
(13, 13, 5, 'The Original Coke paired wonderfully with my meal. It brought back nostalgic memories. The ambiance of the restaurant was lively and fun!', '2024-09-20 22:00:00'),
(14, 14, 2, 'I ordered the Apple Juice, and it was way too sweet for my taste. The service was slow, and the environment felt cramped.', '2024-09-20 23:00:00'),
(15, 15, 1, 'The experience was disappointing. The Chicken Alfredo lacked flavor and the pasta was overcooked. The noise level in the restaurant was also too high to enjoy my meal.', '2024-09-20 23:30:00');


INSERT INTO `tables` (`id`, `table_number`, `capacity`, `is_available`) VALUES
(1, 1, 2, 1),
(2, 2, 2, 1),
(3, 3, 4, 1),
(4, 4, 4, 1),
(5, 5, 6, 1),
(6, 6, 8, 1),
(7, 7, 2, 1),
(8, 8, 4, 1),
(9, 9, 6, 1),
(10, 10, 8, 1),
(11, 11, 10, 1),
(12, 12, 12, 1),
(13, 13, 4, 1),
(14, 14, 6, 1),
(15, 15, 8, 1),
(16, 16, 2, 1),
(17, 17, 4, 1),
(18, 18, 6, 1),
(19, 19, 8, 1),
(20, 20, 10, 1);




INSERT INTO reservations (user_id, table_number, reservation_date, reservation_time, number_of_people, status, created_at, comment) VALUES
(1, 1, '2024-09-02', '18:00:00', 2, 'confirmed', '2024-09-01 10:00:00', 'Anniversary dinner'),
(2, 3, '2024-09-02', '19:00:00', 4, 'confirmed', '2024-09-01 11:30:00', NULL),
(3, 6, '2024-09-03', '20:00:00', 7, 'pending', '2024-09-02 09:15:00', 'Birthday celebration'),
(4, 2, '2024-09-04', '18:30:00', 2, 'confirmed', '2024-09-03 14:00:00', NULL),
(5, 5, '2024-09-05', '19:30:00', 5, 'confirmed', '2024-09-04 16:45:00', 'Business dinner'),
(6, 8, '2024-09-06', '20:30:00', 4, 'pending', '2024-09-05 11:20:00', NULL),
(7, 10, '2024-09-07', '18:00:00', 8, 'confirmed', '2024-09-06 13:10:00', 'Family gathering'),
(8, 4, '2024-09-08', '19:00:00', 3, 'confirmed', '2024-09-07 10:30:00', NULL),
(9, 7, '2024-09-09', '20:00:00', 2, 'pending', '2024-09-08 15:45:00', 'Date night'),
(10, 11, '2024-09-10', '18:30:00', 9, 'confirmed', '2024-09-09 12:00:00', 'Company event'),
(11, 13, '2024-09-11', '19:30:00', 4, 'confirmed', '2024-09-10 17:20:00', NULL),
(12, 15, '2024-09-12', '20:30:00', 7, 'pending', '2024-09-11 09:40:00', 'Friend reunion'),
(13, 9, '2024-09-13', '18:00:00', 5, 'confirmed', '2024-09-12 14:15:00', NULL),
(14, 12, '2024-09-14', '19:00:00', 10, 'confirmed', '2024-09-13 11:30:00', 'Engagement party'),
(15, 14, '2024-09-15', '20:00:00', 6, 'pending', '2024-09-14 16:00:00', NULL),
(1, 16, '2024-09-16', '18:30:00', 2, 'confirmed', '2024-09-15 10:45:00', 'Quick dinner'),
(2, 17, '2024-09-16', '19:30:00', 4, 'confirmed', '2024-09-15 13:20:00', NULL),
(3, 18, '2024-09-17', '20:30:00', 5, 'pending', '2024-09-16 15:10:00', 'Celebration dinner'),
(4, 19, '2024-09-17', '18:00:00', 7, 'confirmed', '2024-09-16 17:45:00', NULL),
(5, 20, '2024-09-18', '19:00:00', 9, 'confirmed', '2024-09-17 11:00:00', 'Birthday party'),
(6, 1, '2024-09-18', '20:00:00', 2, 'pending', '2024-09-17 14:30:00', NULL),
(7, 3, '2024-09-19', '18:30:00', 3, 'confirmed', '2024-09-18 09:15:00', 'Anniversary'),
(8, 5, '2024-09-19', '19:30:00', 5, 'confirmed', '2024-09-18 12:40:00', NULL),
(9, 8, '2024-09-20', '20:30:00', 4, 'pending', '2024-09-19 16:20:00', 'Double date'),
(10, 10, '2024-09-20', '18:00:00', 7, 'confirmed', '2024-09-19 18:50:00', NULL),
(11, 11, '2024-09-21', '19:00:00', 8, 'confirmed', '2024-09-20 10:30:00', 'Family dinner'),
(12, 13, '2024-09-21', '20:00:00', 4, 'pending', '2024-09-20 13:15:00', NULL),
(13, 15, '2024-09-21', '18:30:00', 6, 'confirmed', '2024-09-20 15:45:00', 'Business meeting'),
(14, 2, '2024-09-21', '19:30:00', 2, 'confirmed', '2024-09-20 17:20:00', NULL),
(15, 4, '2024-09-21', '20:30:00', 3, 'pending', '2024-09-20 19:00:00', 'Casual dinner');


INSERT INTO `inventory` (`id`, `item_name`, `quantity`, `unit`) VALUES
(1, 'Rice', 50, 'kg'),
(2, 'Chicken Breast', 30, 'kg'),
(3, 'Ground Beef', 40, 'kg'),
(4, 'Mozzarella Cheese', 25, 'kg'),
(5, 'Fresh Basil', 10, 'bunches'),
(6, 'Pasta', 20, 'kg'),
(7, 'Tomato Sauce', 15, 'liters'),
(8, 'Lettuce', 20, 'kg'),
(9, 'Eggs', 100, 'units'),
(10, 'Olive Oil', 10, 'liters'),
(11, 'Garlic', 5, 'kg'),
(12, 'Onions', 25, 'kg'),
(13, 'Bell Peppers', 15, 'kg'),
(14, 'Sushi Rice', 20, 'kg'),
(15, 'Soy Sauce', 10, 'liters');