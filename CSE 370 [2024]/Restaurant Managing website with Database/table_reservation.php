<?php
session_start();
require_once 'db_connection.php';
$isLoggedIn = isset($_SESSION['user_id']);
$username = $isLoggedIn ? $_SESSION['username'] : '';

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

// Fetch user information
$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare("SELECT name, phone_number, email FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

// Fetch available tables
$stmt = $conn->prepare("SELECT id, table_number, capacity FROM tables WHERE is_available = TRUE");
$stmt->execute();
$tables_result = $stmt->get_result();
$available_tables = $tables_result->fetch_all(MYSQLI_ASSOC);

// Handle form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $table_id = $_POST['table_id'];
    $reservation_date = $_POST['reservation_date'];
    $reservation_time = $_POST['reservation_time'];
    $number_of_people = $_POST['number_of_people'];
    $comment = $_POST['comment'];

    // Get the table_number based on the selected table_id
    $stmt = $conn->prepare("SELECT table_number FROM tables WHERE id = ?");
    $stmt->bind_param("i", $table_id);
    $stmt->execute();
    $table_result = $stmt->get_result();
    $table_data = $table_result->fetch_assoc();
    $table_number = $table_data['table_number'];

    $stmt = $conn->prepare("INSERT INTO reservations (user_id, table_number, reservation_date, reservation_time, number_of_people, comment) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("iissis", $user_id, $table_number, $reservation_date, $reservation_time, $number_of_people, $comment);
    
    if ($stmt->execute()) {
        $success_message = "Reservation submitted successfully!";
    } else {
        $error_message = "Error submitting reservation. Please try again.";
    }
}

$cartItemCount = isset($_SESSION['cart']) ? array_sum(array_column($_SESSION['cart'], 'quantity')) : 0;
$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Restaurant</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    
    <link href="https://fonts.googleapis.com/css?family=Poppins:100,200,300,400,500,600,700,800,900" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Great+Vibes&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="css/open-iconic-bootstrap.min.css">
    <link rel="stylesheet" href="css/animate.css">
    
    <link rel="stylesheet" href="css/owl.carousel.min.css">
    <link rel="stylesheet" href="css/owl.theme.default.min.css">
    <link rel="stylesheet" href="css/magnific-popup.css">

    <link rel="stylesheet" href="css/aos.css">

    <link rel="stylesheet" href="css/ionicons.min.css">

    <link rel="stylesheet" href="css/bootstrap-datepicker.css">
    <link rel="stylesheet" href="css/jquery.timepicker.css">
    

    
    <link rel="stylesheet" href="css/flaticon.css">
    <link rel="stylesheet" href="css/icomoon.css">
    <link rel="stylesheet" href="css/style.css">
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
			    <li class="nav-item"><a href="cart.php" class="nav-link">cart (<?php echo $cartItemCount; ?>) </a></l>
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
    <!-- END nav -->
    <section class="hero-wrap hero-wrap-2" style="background-image: url('images/bg_7.png');" data-stellar-background-ratio="0.5">
      <div class="overlay"></div>
      <div class="container">
        <div class="row no-gutters slider-text align-items-end justify-content-center">
          <div class="col-md-9 ftco-animate text-center mb-4">
            <h1 class="mb-2 bread">Reserve A Table </h1>
            <p class="breadcrumbs"><span class="mr-2"><a href="index.php">Home <i class="ion-ios-arrow-forward"></i></a></span> <span><a href="table_reservation.php">Reservation <i class="ion-ios-arrow-forward"></i></a></span></p>
          </div>
        </div>
      </div>
    </section>


    <!-- complete the reservation form section with php -->
     
    <section id="gtco-reservation" class="bg-fixed bg-white section-padding overlay" ">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="reservation-form">
                        <h2 class="text-center mb-4">Table Reservation</h2>
                        
                        <?php if (isset($success_message)): ?>
                            <div class="alert alert-success"><?php echo $success_message; ?></div>
                        <?php endif; ?>

                        <?php if (isset($error_message)): ?>
                            <div class="alert alert-danger"><?php echo $error_message; ?></div>
                        <?php endif; ?>

                        <form method="post" action="">
                        <div class="form-group">
                            <label for="table_id">Available Tables:</label>
                            <select class="form-control" id="table_id" name="table_id" required>
                                <option value="">Select a table</option>
                                <?php foreach ($available_tables as $table): ?>
                                    <option value="<?php echo $table['id']; ?>">
                                        Table <?php echo $table['table_number']; ?> (Capacity: <?php echo $table['capacity']; ?>)
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="name">Name:</label>
                            <input type="text" class="form-control" id="name" name="name" value="<?php echo htmlspecialchars($user['name']); ?>" readonly>
                        </div>

                        <div class="form-group">
                            <label for="phone_number">Phone Number:</label>
                            <input type="text" class="form-control" id="phone_number" name="phone_number" value="<?php echo htmlspecialchars($user['phone_number']); ?>" readonly>
                        </div>

                        <div class="form-group">
                            <label for="reservation_date">Reservation Date:</label>
                            <input type="date" class="form-control" id="reservation_date" name="reservation_date" required>
                        </div>

                        <div class="form-group">
                            <label for="reservation_time">Reservation Time:</label>
                            <input type="time" class="form-control" id="reservation_time" name="reservation_time" required>
                        </div>

                        <div class="form-group">
                            <label for="number_of_people">Number of People:</label>
                            <select class="form-control" id="number_of_people" name="number_of_people" required>
                                <option value="">Select number of people</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="comment">Comment (Optional):</label>
                            <textarea class="form-control" id="comment" name="comment" rows="3"></textarea>
                        </div>

                        <button type="submit" style="margin-bottom: 1.3vh;" class="btn btn-primary btn-block">Submit Reservation</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</section>

<script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.3/dist/umd/popper.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
<script>
    $(document).ready(function() {
        $('#table_id').change(function() {
            var selectedTable = $(this).find(':selected');
            var capacity = selectedTable.text().match(/Capacity: (\d+)/);
            
            if (capacity) {
                var maxCapacity = parseInt(capacity[1]);
                var options = '';
                for (var i = 1; i <= maxCapacity; i++) {
                    options += '<option value="' + i + '">' + i + '</option>';
                }
                $('#number_of_people').html(options);
            }
        });
    });
</script>
    <?php include 'footer.php'; ?>

</body>
</html>