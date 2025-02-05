<?php
session_start();
include 'db_connection.php'; 


$user_id = $_SESSION['user_id']; 
$isLoggedIn = isset($_SESSION['user_id']);
$username = $isLoggedIn ? $_SESSION['username'] : '';

// for fetching user info
$user_query = "SELECT name, username, phone_number, email FROM users WHERE id = ?";
$user_stmt = $conn->prepare($user_query);
$user_stmt->bind_param("i", $user_id);
$user_stmt->execute();
$user_result = $user_stmt->get_result();
$user = $user_result->fetch_assoc();

// for fetching userreview
$review_query = "SELECT rating, comment FROM reviews WHERE user_id = ? LIMIT 1";
$review_stmt = $conn->prepare($review_query);
$review_stmt->bind_param("i", $user_id);
$review_stmt->execute();
$review_result = $review_stmt->get_result();
$review = $review_result->fetch_assoc();

// for fetching user user's order history
$order_query = "SELECT o.id, o.created_at, oi.quantity, mi.name AS item_name, mi.price AS item_price,
                       (oi.quantity * mi.price) AS item_total, o.status
                FROM orders o
                JOIN order_items oi ON o.id = oi.order_id
                JOIN menu_items mi ON oi.menu_item_id = mi.id
                WHERE o.user_id = ?
                ORDER BY o.created_at DESC";
$order_stmt = $conn->prepare($order_query);
$order_stmt->bind_param("i", $user_id);
$order_stmt->execute();
$order_result = $order_stmt->get_result();

// for fetching user user's table reservations
$reservation_query = "SELECT r.id, r.table_number, r.reservation_date, r.reservation_time, r.number_of_people, r.status
                      FROM reservations r
                      WHERE r.user_id = ?
                      ORDER BY r.reservation_date DESC, r.reservation_time DESC";
$reservation_stmt = $conn->prepare($reservation_query);
$reservation_stmt->bind_param("i", $user_id);
$reservation_stmt->execute();
$reservation_result = $reservation_stmt->get_result();
$cartItemCount = isset($_SESSION['cart']) ? array_sum(array_column($_SESSION['cart'], 'quantity')) : 0;


$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>User Profile</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/js/all.min.js"></script>
    <link href="https://fonts.googleapis.com/css?family=Poppins:100,200,300,400,500,600,700,800,900" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Great+Vibes&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="css/open-iconic-bootstrap.min.css">
    <link rel="stylesheet" href="css/animate.css">
    <link rel="stylesheet" href="css/owl.carousel.min.css">
    <link rel="stylesheet" href="css/magnific-popup.css">
    <link rel="stylesheet" href="css/aos.css">
    <link rel="stylesheet" href="css/ionicons.min.css">
    <link rel="stylesheet" href="css/bootstrap-datepicker.css">
    <link rel="stylesheet" href="css/jquery.timepicker.css">
    <link rel="stylesheet" href="css/flaticon.css">
    <link rel="stylesheet" href="css/icomoon.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css2/prof.css"> 
</head>
<body>
<nav class="navbar navbar-expand-lg navbar-dark ftco_navbar bg-dark ftco-navbar-light" id="ftco-navbar">
	    <div class="container">
	      <a class="navbar-brand" href="index.php">Lunch</a>
	      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#ftco-nav" aria-controls="ftco-nav" aria-expanded="false" aria-label="Toggle navigation">
	        <span class="oi oi-menu"></span> Menu
	      </button>

	      <div class="collapse navbar-collapse" id="ftco-nav">
	        <ul class="navbar-nav ml-auto">
			    <li class="nav-item"><a href="cart.php" class="nav-link">Cart (<?php echo $cartItemCount; ?>)</a></li>
	        	<li class="nav-item"><a href="menu.php" class="nav-link">Menu</a></li>
				<li class="nav-item"><a href="reviews.php" class="nav-link">Reviews</a></li>
	          <li class="nav-item"><a href="table_reservation.php" class="nav-link">Book a table</a></li>
              <?php if ($isLoggedIn): ?>
                <li class="nav-item"><a href="profile.php" class="nav-link"><?php echo htmlspecialchars($username); ?></a></li>
                <li class="nav-item cta"><a href="logout.php" class="nav-link">Logout</a></li>
              <?php else: ?>
                <li class="nav-item"><a href="profile.php" class="nav-link">Profile</a></li>
                <li class="nav-item cta"><a href="login.php" class="nav-link">Login</a></li>
              <?php endif; ?>			  
	        </ul>
	      </div>
	    </div>
	  </nav>
      
<section class="hero-wrap hero-wrap-2" style="background-image: url('images/bg_6.png');" data-stellar-background-ratio="0.5">
      <div class="overlay"></div>
      <div class="container">
        <div class="row no-gutters slider-text align-items-end justify-content-center">
          <div class="col-md-9 ftco-animate text-center mb-4">
            <h1 class="mb-2 bread">Your profile</h1>
            <p class="breadcrumbs"><span class="mr-2"><a href="index.php">Home <i class="ion-ios-arrow-forward"></i></a></span> <span><a href="profile.php">profile <i class="ion-ios-arrow-forward"></i></a></span></p>
          </div>
        </div>
      </div>
    </section>
    
    <div class="container">
        <div class="profile-header">
            <img src="images/avatar.jpg" alt="User Avatar" class="avatar">
            <div class="user-info">
                <h1><?php echo htmlspecialchars($user['name']); ?></h1>
                <div class="user-details">
                    <p><strong>Username:</strong> <?php echo htmlspecialchars($user['username']); ?></p>
                    <p><strong>Phone:</strong> <?php echo htmlspecialchars($user['phone_number']); ?></p>
                    <p><strong>Email:</strong> <?php echo htmlspecialchars($user['email']); ?></p>
                </div>
            </div>
            <div class="profile-actions">
                <button class="edit-profile" onclick="showEditProfilePopup();">Edit Profile</button>
                <button class="delete-profile" onclick="showDeleteProfilePopup();">Delete Profile</button>
            </div>
        </div>

        <?php if ($review): ?>
        <div class="review">
            <h2>My Review</h2> 
            <div class="stars">
                <?php
                for ($i = 1; $i <= 5; $i++) {
                    echo $i <= $review['rating'] ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
                }
                ?>
            </div>
            <p><?php echo htmlspecialchars($review['comment']); ?></p>
            <button class="edit-review" onclick="window.location.href='reviews.php'">Edit Review </button>
        </div>
        <?php endif; ?>

        <div class="reservations">
            <h2><img src="images/tables.svg" alt="Table Icon" class="section-icon">My Reservations</h2>
            <?php if ($reservation_result->num_rows > 0): ?>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Table</th>
                            <th>People</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php while ($reservation = $reservation_result->fetch_assoc()): ?>
                        <tr>
                            <td><?php echo date('Y-m-d', strtotime($reservation['reservation_date'])); ?></td>
                            <td><?php echo date('H:i', strtotime($reservation['reservation_time'])); ?></td>
                            <td><?php echo htmlspecialchars($reservation['table_number']); ?></td>
                            <td><?php echo htmlspecialchars($reservation['number_of_people']); ?></td>
                            <td><?php echo ucfirst(htmlspecialchars($reservation['status'])); ?></td>
                        </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
            <?php else: ?>
                <p>You have no table reservations.</p>
            <?php endif; ?>
        </div>

        <div class="order-history">
            <h2><img src="images/order.svg" alt="Order Icon" class="section-icon">Order History</h2>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <?php while ($order = $order_result->fetch_assoc()): ?>
                        <tr>
                            <td><?php echo date('Y-m-d', strtotime($order['created_at'])); ?></td>
                            <td><?php echo htmlspecialchars($order['quantity'] . 'x ' . $order['item_name']); ?></td>
                            <td>$<?php echo number_format($order['item_total'], 2); ?></td>
                            <td><?php echo htmlspecialchars($order['status']); ?></td>
                        </tr>
                    <?php endwhile; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Edit Profile Popup -->
    <div id="editProfilePopup" class="popup">
        <div class="popup-content">
            <span class="close" onclick="closePopup('editProfilePopup')">&times;</span>
            <h2>Edit Profile</h2>
            <form id="editProfileForm">
                <div class="form-group">
                    <label for="name">Name:</label>
                    <input type="text" id="name" name="name" value="<?php echo htmlspecialchars($user['name']); ?>" required>
                </div>
                <div class="form-group">
                    <label for="phone">Phone:</label>
                    <input type="tel" id="phone" name="phone" value="<?php echo htmlspecialchars($user['phone_number']); ?>" required>
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($user['email']); ?>" required>
                </div>
                <button type="submit">Update Profile</button>
            </form>
        </div>
    </div>

    <div id="deleteProfilePopup" class="popup">
        <div class="popup-content">
            <span class="close" onclick="closePopup('deleteProfilePopup')">&times;</span>
            <h2>Delete Profile</h2>
            <p>Are you sure you want to delete your profile? This action cannot be undone.</p>
            <button onclick="deleteProfile()">Yes, Delete My Profile</button>
            <button onclick="closePopup('deleteProfilePopup')">No, Keep My Profile</button>
        </div>
    </div>

    <script>


        function showEditProfilePopup() {
            document.getElementById('editProfilePopup').style.display = 'block';
        }

        function showDeleteProfilePopup() {
            document.getElementById('deleteProfilePopup').style.display = 'block';
        }

        function closePopup(popupId) {
            document.getElementById(popupId).style.display = 'none';
        }

        document.getElementById('editProfileForm').addEventListener('submit', function(e) {
            e.preventDefault();
            editProfile();
        });

        function editProfile() {
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;

            fetch('edit_profile.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Profile updated successfully!');
                    closePopup('editProfilePopup');
                    location.reload(); 
                } else {
                    alert('Failed to update profile: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while updating the profile.');
            });
        }

        function deleteProfile() {
            fetch('delete_profile.php', {
                method: 'POST',
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Profile deleted successfully. You will be redirected to the homepage.');
                    window.location.href = 'index.php'; 
                } else {
                    alert('Failed to delete profile: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while deleting the profile.');
            });
        }
    </script>
</body>
</html>
<?php
include 'footer.php';
?>