//gcc -o main task1.c && ./main
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    char userInput[1000000];
    int sum = 0;
    printf("Enter a number: ");
    fgets(userInput, sizeof(userInput), stdin);
    printf("user input is : %s\n", userInput);

    for(int i = 0; userInput[i] != '\0'; i++) {
        if(userInput[i] >= '0' && userInput[i] <= '9') {
            sum += userInput[i] - '0';
        }
    }
    printf("Sum of digits: %d\n", sum);
    return 0;
}

