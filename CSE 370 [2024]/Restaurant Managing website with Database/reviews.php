<?php
session_start();
include 'db_connection.php';

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

$isLoggedIn = isset($_SESSION['user_id']);
$username = $isLoggedIn ? $_SESSION['username'] : '';
$user_id = $_SESSION['user_id'];
$error = "";
$success = "";

// Fetch all reviews and related users
$query = "SELECT reviews.id, reviews.rating, reviews.comment, reviews.created_at, users.username 
          FROM reviews 
          JOIN users ON reviews.user_id = users.id
          ORDER BY reviews.created_at DESC";
$result = mysqli_query($conn, $query);

// Fetch the logged-in user's review if it exists
$userReviewQuery = "SELECT * FROM reviews WHERE user_id = $user_id";
$userReviewResult = mysqli_query($conn, $userReviewQuery);
$userReview = mysqli_fetch_assoc($userReviewResult);

// Handle form submission (adding or updating a review)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        if ($_POST['action'] === 'add_update') {
            $rating = $_POST['rating'];
            $comment = $_POST['comment'];

            if ($userReview) {
                // Update the existing review
                $updateQuery = "UPDATE reviews SET rating = '$rating', comment = '$comment' WHERE user_id = $user_id";
                if (mysqli_query($conn, $updateQuery)) {
                    $success = "Review updated successfully!";
                } else {
                    $error = "Error updating review: " . mysqli_error($conn);
                }
            } else {
                // Insert a new review
                $insertQuery = "INSERT INTO reviews (user_id, rating, comment) VALUES ('$user_id', '$rating', '$comment')";
                if (mysqli_query($conn, $insertQuery)) {
                    $success = "Review added successfully!";
                } else {
                    $error = "Error adding review: " . mysqli_error($conn);
                }
            }
        } elseif ($_POST['action'] === 'delete') {
            if ($userReview) {
                $deleteQuery = "DELETE FROM reviews WHERE user_id = $user_id";
                if (mysqli_query($conn, $deleteQuery)) {
                    $success = "Review deleted successfully!";
                    $userReview = null; // Clear the user review after deletion
                } else {
                    $error = "Error deleting review: " . mysqli_error($conn);
                }
            } else {
                $error = "No review found to delete.";
            }
        }
    }
}
$cartItemCount = isset($_SESSION['cart']) ? array_sum(array_column($_SESSION['cart'], 'quantity')) : 0;

// Close the database connection
mysqli_close($conn);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Restaurant Reviews</title>
    <link rel="stylesheet" href="styles.css">
    <link href='https://fonts.googleapis.com/css?family=Didact+Gothic' rel='stylesheet' type='text/css'>
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
    <link rel="stylesheet" href="css2/rev.css"> 


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
      
<section class="hero-wrap hero-wrap-2" style="background-image: url('images/bg_5.png');" data-stellar-background-ratio="0.5">
      <div class="overlay"></div>
      <div class="container">
        <div class="row no-gutters slider-text align-items-end justify-content-center">
          <div class="col-md-9 ftco-animate text-center mb-4">
            <h1 class="mb-2 bread">What other customers saying </h1>
            <p class="breadcrumbs"><span class="mr-2"><a href="index.php">Home <i class="ion-ios-arrow-forward"></i></a></span> <span><a href="reviews.php">reviews <i class="ion-ios-arrow-forward"></i></a></span></p>
          </div>
        </div>
      </div>
    </section>

<div class="container">
    <h1>Restaurant Reviews</h1>

    <!-- Display success/error messages -->
    <?php if ($success): ?>
        <div class="success"><?php echo $success; ?></div>
    <?php endif; ?>
    <?php if ($error): ?>
        <div class="error"><?php echo $error; ?></div>
    <?php endif; ?>

    <!-- Review form -->
    <div class="review-form">
        <h2><?php echo $userReview ? 'Update' : 'Add'; ?> Your Review</h2>
        <form method="POST" id="reviewForm">
            <label for="rating">Rating:</label>
            <select name="rating" id="rating">
                <option value="5" <?php echo ($userReview && $userReview['rating'] == 5) ? 'selected' : ''; ?>>5 - Excellent</option>
                <option value="4" <?php echo ($userReview && $userReview['rating'] == 4) ? 'selected' : ''; ?>>4 - Good</option>
                <option value="3" <?php echo ($userReview && $userReview['rating'] == 3) ? 'selected' : ''; ?>>3 - Average</option>
                <option value="2" <?php echo ($userReview && $userReview['rating'] == 2) ? 'selected' : ''; ?>>2 - Poor</option>
                <option value="1" <?php echo ($userReview && $userReview['rating'] == 1) ? 'selected' : ''; ?>>1 - Terrible</option>
            </select>
            <label for="comment">Comment:</label>
            <textarea name="comment" id="comment"><?php echo $userReview ? $userReview['comment'] : ''; ?></textarea>
            <div class="button-container">
                <button type="submit" name="action" value="add_update" class="cssbuttons-io-button add-update-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"></path><path fill="currentColor" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"></path></svg>
                    <?php echo $userReview ? 'Update' : 'Add'; ?>
                </button>
                <button type="button" id="deleteButton" class="cssbuttons-io-button delete-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"></path><path fill="currentColor" d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"></path></svg>
                    Delete
                </button>
            </div>
        </form>
    </div>

    <!-- Delete Confirmation Modal -->
    <div id="deleteModal" class="modal">
        <div class="modal-content">
            <p>Are you sure you want to delete your review?</p>
            <div class="modal-buttons">
                <button id="confirmDelete" class="modal-confirm">Yes, Delete</button>
                <button id="cancelDelete" class="modal-cancel">Cancel</button>
            </div>
        </div>
    </div>

    <!-- Display all reviews -->
    <div class="reviews-section">
        <?php while ($row = mysqli_fetch_assoc($result)): ?>
            <div class="review-box">
                <img src="images/avatar.jpg" alt="User Avatar" class="avatar">
                <h3><?php echo $row['username']; ?> - <?php echo $row['rating']; ?>/5 ⭐</h3>
                <p><?php echo $row['comment']; ?></p>
                <small><?php echo date('F j, Y', strtotime($row['created_at'])); ?></small>
            </div>
        <?php endwhile; ?>
    </div>
</div>

<script>
    // Get the modal
    var modal = document.getElementById("deleteModal");

    // Get the button that opens the modal
    var btn = document.getElementById("deleteButton");

    // Get the <span> element that closes the modal
    var confirmBtn = document.getElementById("confirmDelete");
    var cancelBtn = document.getElementById("cancelDelete");

    // When the user clicks the button, open the modal 
    btn.onclick = function() {
        modal.style.display = "block";
    }

    // When the user clicks on Cancel, close the modal
    cancelBtn.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // When the user confirms deletion
    confirmBtn.onclick = function() {
        var form = document.getElementById("reviewForm");
        var input = document.createElement("input");
        input.type = "hidden";
        input.name = "action";
        input.value = "delete";
        form.appendChild(input);
        form.submit();
    }
</script>

</body>
</html>
<?php
include 'footer.php';
?>