# Number : 1
values <- c(90, 178, 547, 453, 189, 377, 264, 333, 289, 391, 320, 300, 210, 310, 121, 154, 248, 292, 368, 423)

mean_value <- mean(values)
median_value <- median(values)
std_deviation <- sd(values)

sqrt_values <- sqrt(values)


sorted_values <- sort(values)


vector_length <- length(values)

sum_values <- sum(values)
product_values <- prod(values)


cat("Mean:", mean_value, "\n")
cat("Median:", median_value, "\n")
cat("Standard Deviation:", std_deviation, "\n\n")
cat("Square Roots:", sqrt_values, "\n\n")
cat("Sorted Values:", sorted_values, "\n\n")
cat("Length of Vector:", vector_length, "\n\n")
cat("Sum of Values:", sum_values, "\n")
cat("Product of Values:", product_values, "\n")


#Number 2 
data <- data.frame(
  Number_of_Rooms = c(12, 9, 14, 6, 10),
  KWH = c(9, 7, 10, 5, 8)
)

correlation_coefficient <- cor(data$Number_of_Rooms, data$KWH)

regression_model <- lm(KWH ~ Number_of_Rooms, data = data)
intercept <- coef(regression_model)[1]
slope <- coef(regression_model)[2]


plot(data$Number_of_Rooms, data$KWH, main = "Scatter Plot of KWH vs Number of Rooms", 
     xlab = "Number of Rooms", ylab = "KWH", pch = 19, col = "blue")
abline(regression_model, col = "red")

cat("Pearson's Correlation Coefficient:", correlation_coefficient, "\n")
cat("Intercept of Regression:", intercept, "\n")
cat("Slope of Regression:", slope, "\n")
