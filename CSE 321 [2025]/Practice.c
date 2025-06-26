#include <stdio.h>
#include <string.h>
#define PI 3.14159

// Function to print personal details
void printDetails() {
    printf("Name: Rafi Ahmed\n");
    printf("Date of Birth: Feb\n");
    printf("Mobile Number: +880\n");
}

void computeRectangleProperties(int height, int width) {
    int perimeter = 2 * (height + width);
    int area = height * width;
    printf("Perimeter: %d inches\n", perimeter);
    printf("Area: %d square inches\n", area);
}

// Function to compute perimeter and area of a circle
void computeCircleProperties(double radius) {
    double perimeter = 2 * PI * radius;
    double area = PI * radius * radius;
    printf("Circle Perimeter: %.2f inches\n", perimeter);
    printf("Circle Area: %.2f square inches\n", area);
}

// Function to print array elements
void printArray(int arr[], int size) {
    printf("Stored elements in the array:\n");
    for(int i = 0; i < size; i++) {
        printf("%d ", arr[i]);
    }
    printf("\n");
}

void reverseArray() {
    int n, i;
    printf("Enter the number of elements: ");
    scanf("%d", &n);
    
    int arr[n];
    
    printf("Enter %d elements:\n", n);
    for(i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    
    printf("Array in reverse order: ");
    for(i = n-1; i >= 0; i--) {
        printf("%d ", arr[i]);
    }
    printf("\n");
}


void convertSeconds() {
    int totalSeconds, hours, minutes, seconds;
    printf("Enter time in seconds: ");
    scanf("%d", &totalSeconds);
    
    hours = totalSeconds / 3600;
    minutes = (totalSeconds % 3600) / 60;
    seconds = (totalSeconds % 3600) % 60;
    
    printf("%d seconds = %d hours, %d minutes, %d seconds\n", 
           totalSeconds, hours, minutes, seconds);
}


void swapVariables() {
    int a, b, temp;
    
    printf("Enter first number: ");
    scanf("%d", &a);
    printf("Enter second number: ");
    scanf("%d", &b);
    
    printf("Before swapping: a = %d, b = %d\n", a, b);
    
    
    temp = a;
    a = b;
    b = temp;
    
    printf("After swapping: a = %d, b = %d\n", a, b);
}

void printASCII() {
    char ch;

    printf("Enter a character: ");
    scanf(" %c", &ch);

    printf("ASCII value of '%c' is %d\n", ch, ch);
}


void concatenateStrings() {
    char str1[50], str2[50];
    
    printf("Enter first string: ");
    while ((getchar()) != '\n');
    fgets(str1, sizeof(str1), stdin);
    str1[strcspn(str1, "\n")] = 0; 
    
    printf("Enter second string: ");
    fgets(str2, sizeof(str2), stdin);
    str2[strcspn(str2, "\n")] = 0; 
    
    strcat(str1, str2);
    
    printf("Concatenated string: %s\n", str1);
}


void studentInfo() {
    struct Student {
        char name[50];
        int rollNo;
        float marks;
    };
    
    struct Student student;

    printf("Enter student name: ");

    scanf("%49[^\n]", student.name); 

    printf("Enter roll number: ");
    scanf("%d", &student.rollNo);

    printf("Enter marks: ");
    scanf("%f", &student.marks);

    printf("\nStudent Information:\n");
    printf("Name: %s\n", student.name);
    printf("Roll Number: %d\n", student.rollNo);
    printf("Marks: %.2f\n", student.marks);
}
int main() {
    printf("Q1\n");
    printDetails();
    printf("\n");
    printf("Q2\n");
    computeRectangleProperties(7, 5);
    printf("\n");
    printf("Q3\n");
    computeCircleProperties(4.0);
    printf("\n");
    printf("Q4\n");
    int arr[] = {10, 20, 30, 40, 50}; 
    int size = sizeof(arr) / sizeof(arr[0]); 
    printArray(arr, size);
    printf("\n");
    printf("Q5\n");
    reverseArray();
    printf("\n");
    printf("Q6\n");
    convertSeconds();
    printf("\n");
    printf("Q7\n");
    swapVariables();
    printf("\n");
    printf("Q8\n");
    printASCII();
    printf("\n");
    printf("Q9\n");
    concatenateStrings();
    printf("\n");
    printf("Q10\n");
    studentInfo();
    
    
    return 0;
}
