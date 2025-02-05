<?php
session_start();
require_once 'db_connection.php';

$isLoggedIn = isset($_SESSION['user_id']);
$username = $isLoggedIn ? $_SESSION['username'] : '';

//updating quantity
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_quantity'])) {
    if (isset($_POST['quantity']) && is_array($_POST['quantity'])) {
        foreach ($_POST['quantity'] as $item_id => $new_quantity) {
            $new_quantity = intval($new_quantity);
            if ($new_quantity > 0) {
                $_SESSION['cart'][$item_id]['quantity'] = $new_quantity;
            } else {
                unset($_SESSION['cart'][$item_id]);
            }
        }
    }

    // prevent form resubmission
    header("Location: cart.php");
    exit();
}

// Handle empty cart action
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['empty_cart'])) {
    unset($_SESSION['cart']);
    header("Location: cart.php");
    exit();
}

// Handle order placement
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['place_order'])) {
    if ($isLoggedIn && !empty($_SESSION['cart'])) {
        $user_id = $_SESSION['user_id'];
        $total_amount = 0;

        foreach ($_SESSION['cart'] as $item) {
            $total_amount += $item['price'] * $item['quantity'];
        }

        // Insert order into the database
        $stmt = $conn->prepare("INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, 'pending')");
        $stmt->bind_param("id", $user_id, $total_amount);
        $stmt->execute();
        $order_id = $stmt->insert_id;

        // Insert order items
        $stmt = $conn->prepare("INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)");
        foreach ($_SESSION['cart'] as $item_id => $item) {
            $stmt->bind_param("iiid", $order_id, $item_id, $item['quantity'], $item['price']);
            $stmt->execute();
        }

        // Clear the cart
        unset($_SESSION['cart']);

        // Redirect to a thank you page
        header("Location: order_confirmation.php?order_id=" . $order_id);
        exit();
    } else {
        $error_message = $isLoggedIn ? "Your cart is empty." : "Please log in to place an order.";
    }
}

$cartItemCount = isset($_SESSION['cart']) ? array_sum(array_column($_SESSION['cart'], 'quantity')) : 0;

?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Cart</title>
    <meta charset="utf-8">
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
    <!-- Navbar section -->
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
            <h1 class="mb-2 bread">Your Cart</h1>
            <p class="breadcrumbs"><span class="mr-2"><a href="menu.php">Menu <i class="ion-ios-arrow-forward"></i></a></span> <span><a href="cart.php">Cart <i class="ion-ios-arrow-forward"></i></a></span></p>
          </div>
        </div>
      </div>
    </section>
    <section class="ftco-section">
        <div class="container">
            <h2>Your Cart</h2>
            <?php if (!empty($_SESSION['cart'])): ?>
                <form method="post" action="cart.php">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php 
                            $total = 0;
                            foreach ($_SESSION['cart'] as $item_id => $item): 
                                $subtotal = $item['price'] * $item['quantity'];
                                $total += $subtotal;
                            ?>
                            <tr>
                                <td><?php echo htmlspecialchars($item['name']); ?></td>
                                <td>$<?php echo number_format($item['price'], 2); ?></td>
                                <td>
                                    <input type="number" name="quantity[<?php echo $item_id; ?>]" value="<?php echo $item['quantity']; ?>" min="0" class="form-control" style="width: 60px;">
                                </td>
                                <td>$<?php echo number_format($subtotal, 2); ?></td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="text-right"><strong>Total:</strong></td>
                                <td>$<?php echo number_format($total, 2); ?></td>
                            </tr>
                        </tfoot>
                    </table>
                    <button type="submit" name="update_quantity" class="btn btn-primary">Update Quantities</button>
                    <button type="submit" name="place_order" class="btn btn-success">Place Order</button>
                </form>
                <form method="post" action="cart.php" class="mt-3">
                    <button type="submit" name="empty_cart" class="btn btn-danger">Empty Cart</button>
                </form>
            <?php else: ?>
                <p>Your cart is empty.</p>
            <?php endif; ?>
        </div>
    </section>

    <?php include 'footer.php'; ?>
</body>
</html>