<?php
session_start();
require_once 'db_connection.php';

$isLoggedIn = isset($_SESSION['user_id']);
$username = $isLoggedIn ? $_SESSION['username'] : '';


function getMenuItems($category = null, $searchTerm = null) {
    global $conn;
    $sql = "SELECT * FROM menu_items WHERE 1=1";
    $params = array();
    $types = "";

    if ($category) {
        $sql .= " AND category = ?";
        $params[] = $category;
        $types .= "s";
    }

    if ($searchTerm) {
        $sql .= " AND name LIKE ?";
        $params[] = "%" . $searchTerm . "%";
        $types .= "s";
    }

    $stmt = $conn->prepare($sql);

    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_all(MYSQLI_ASSOC);
}


$searchTerm = isset($_GET['search']) ? $_GET['search'] : '';


$foodItems = getMenuItems('food', $searchTerm);
$drinkItems = getMenuItems('drink', $searchTerm);

// adding items to cart
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_to_cart'])) {
    $item_id = $_POST['item_id'];
    $item_name = $_POST['item_name'];
    $item_price = $_POST['item_price'];

    if (!isset($_SESSION['cart'])) {
        $_SESSION['cart'] = array();
    }

    if (isset($_SESSION['cart'][$item_id])) {
        $_SESSION['cart'][$item_id]['quantity']++;
    } else {
        $_SESSION['cart'][$item_id] = array(
            'name' => $item_name,
            'price' => $item_price,
            'quantity' => 1
        );
    }

    // Redirect to menu
    header("Location: menu.php");
    exit();
}

// Get the number of items in the cart
$cartItemCount = isset($_SESSION['cart']) ? array_sum(array_column($_SESSION['cart'], 'quantity')) : 0;

?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Menu</title>
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
    <!-- END nav -->

    <!-- Hero section -->
    <section class="hero-wrap hero-wrap-2" style="background-image: url('images/bg_2.jpg');" data-stellar-background-ratio="0.5">
      <div class="overlay"></div>
      <div class="container">
        <div class="row no-gutters slider-text align-items-end justify-content-center">
          <div class="col-md-9 ftco-animate text-center mb-4">
            <h1 class="mb-2 bread">Our Dishes</h1>
            <p class="breadcrumbs"><span class="mr-2"><a href="index.php">Home <i class="ion-ios-arrow-forward"></i></a></span> <span><a href="menu.php">Menu <i class="ion-ios-arrow-forward"></i></a></span></p>
          </div>
        </div>
      </div>
    </section>

    <!-- Menu Tabs section -->
    <section class="ftco-section">
      <div class="container">
        <div class="ftco-search">
          <div class="row">
            <div class="col-md-12 nav-link-wrap">
              <div class="nav nav-pills d-flex text-center" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                <a class="nav-link ftco-animate active" id="v-pills-food-tab" data-toggle="pill" href="#v-pills-food" role="tab" aria-controls="v-pills-food" aria-selected="true">Food</a>  
                <a class="nav-link ftco-animate" id="v-pills-drinks-tab" data-toggle="pill" href="#v-pills-drinks" role="tab" aria-controls="v-pills-drinks" aria-selected="false">Drinks</a>
              </div>
            </div>
            
            <!-- Search Bar -->
            <div class="col-md-12 mt-3">
              <form method="GET" action="menu.php">
                <div class="input-group mb-3">
                  <input type="text" class="form-control" placeholder="Search for menu items" name="search" value="<?php echo htmlspecialchars($searchTerm); ?>">
                  <div class="input-group-append">
                    <button class="btn btn-primary" type="submit">Search</button>
                  </div>
                </div>
              </form>
            </div>

            <div class="col-md-12 tab-wrap">
              <div class="tab-content" id="v-pills-tabContent">

                <!-- Food Tab -->
                <div class="tab-pane fade show active" id="v-pills-food" role="tabpanel" aria-labelledby="v-pills-food-tab">
                  <div class="row no-gutters d-flex align-items-stretch">
                    <?php if (count($foodItems) > 0): ?>
                    <?php foreach ($foodItems as $item): ?>
                    <div class="col-md-12 col-lg-6 d-flex align-self-stretch">
                      <div class="menus d-sm-flex ftco-animate align-items-stretch">
                        <div class="menu-img img" style="background-image: url(<?php echo htmlspecialchars($item['image_url']); ?>);"></div>
                        <div class="text d-flex align-items-center">
                          <div>
                            <div class="d-flex">
                              <div class="one-half">
                                <h3><?php echo htmlspecialchars($item['name']); ?></h3>
                              </div>
                              <div class="one-forth">
                                <span class="price">$<?php echo number_format($item['price'], 2); ?></span>
                              </div>
                            </div>
                            <p><?php echo htmlspecialchars($item['description']); ?></p>
                            <form method="post" action="menu.php">
                                <input type="hidden" name="item_id" value="<?php echo $item['id']; ?>">
                                <input type="hidden" name="item_name" value="<?php echo htmlspecialchars($item['name']); ?>">
                                <input type="hidden" name="item_price" value="<?php echo $item['price']; ?>">
                                <button type="submit" name="add_to_cart" class="btn btn-primary">Add to cart</button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                    <?php endforeach; ?>
                    <?php else: ?>
                    <p>No food items found matching your search.</p>
                    <?php endif; ?>
                  </div>
                </div>

                <!-- Drinks Tab -->
                <div class="tab-pane fade" id="v-pills-drinks" role="tabpanel" aria-labelledby="v-pills-drinks-tab">
                  <div class="row no-gutters d-flex align-items-stretch">
                    <?php if (count($drinkItems) > 0): ?>
                    <?php foreach ($drinkItems as $item): ?>
                    <div class="col-md-12 col-lg-6 d-flex align-self-stretch">
                      <div class="menus d-sm-flex ftco-animate align-items-stretch">
                        <div class="menu-img img" style="background-image: url(<?php echo htmlspecialchars($item['image_url']); ?>);"></div>
                        <div class="text d-flex align-items-center">
                          <div>
                            <div class="d-flex">
                              <div class="one-half">
                                <h3><?php echo htmlspecialchars($item['name']); ?></h3>
                              </div>
                              <div class="one-forth">
                                <span class="price">$<?php echo number_format($item['price'], 2); ?></span>
                              </div>
                            </div>
                            <p><?php echo htmlspecialchars($item['description']); ?></p>
                            <form method="post" action="menu.php">
                                <input type="hidden" name="item_id" value="<?php echo $item['id']; ?>">
                                <input type="hidden" name="item_name" value="<?php echo htmlspecialchars($item['name']); ?>">
                                <input type="hidden" name="item_price" value="<?php echo $item['price']; ?>">
                                <button type="submit" name="add_to_cart" class="btn btn-primary">Add to cart</button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                    <?php endforeach; ?>
                    <?php else: ?>
                    <p>No drink items found matching your search.</p>
                    <?php endif; ?>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer section -->
    <?php include 'footer.php'; ?>

  </body>
</html>