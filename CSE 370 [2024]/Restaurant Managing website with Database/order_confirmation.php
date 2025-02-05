<?php
session_start();
require_once 'db_connection.php';

$isLoggedIn = isset($_SESSION['user_id']);
$username = $isLoggedIn ? $_SESSION['username'] : '';

if (!$isLoggedIn || !isset($_GET['order_id'])) {
    header("Location: index.php");
    exit();
}

$order_id = intval($_GET['order_id']);


$stmt = $conn->prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $order_id, $_SESSION['user_id']);
$stmt->execute();
$order = $stmt->get_result()->fetch_assoc();

if (!$order) {
    header("Location: index.php");
    exit();
}
$cartItemCount = isset($_SESSION['cart']) ? array_sum(array_column($_SESSION['cart'], 'quantity')) : 0;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Order Confirmation</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

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
    <section class="hero-wrap hero-wrap-2" style="background-image: url('images/bg_3.jpg');" data-stellar-background-ratio="0.5">
      <div class="overlay"></div>
      <div class="container">
        <div class="row no-gutters slider-text align-items-end justify-content-center">
          <div class="col-md-9 ftco-animate text-center mb-4">
            <h1 class="mb-2 bread">Our Dishes</h1>
            <p class="breadcrumbs"><span class="mr-2"><a href="cart.php">cart <i class="ion-ios-arrow-forward"></i></a></span> <span><a href="order_confirmation.php">Order Confirmation <i class="ion-ios-arrow-forward"></i></a></span></p>
          </div>
        </div>
      </div>
    </section>

    <section class="ftco-section">
        <div class="container">
            <h2>Thank You for Your Order!</h2>
            <p>Your order (ID: <?php echo $order_id; ?>) has been placed successfully.</p>
            <p>Order Status: <?php echo ucfirst($order['status']); ?></p>
            <p>Total Amount: $<?php echo number_format($order['total_amount'], 2); ?></p>
            <p>We will process your order shortly. You can check the status of your order in your profile.</p>
            <a href="menu.php" class="btn btn-primary">Continue Shopping</a>
        </div>
    </section>

    <?php include "footer.php" ?>
</body>
</html>