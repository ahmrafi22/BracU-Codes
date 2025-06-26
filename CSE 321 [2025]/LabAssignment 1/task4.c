#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

void sort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] < arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

void checkOddEven(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        printf("%d is %s\n", arr[i], (arr[i] % 2 == 0) ? "even" : "odd");
    }
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        printf("Write the numbers porperly with spaces");
        return 1;
    }

    int n = argc - 1;
    int arr[n];
    for (int i = 0; i < n; i++) {
        arr[i] = atoi(argv[i + 1]);
    }

    pid_t pid = fork();

    if (pid == 0) { 
        sort(arr, n);
        printf("Child sorted array: ");
        for (int i = 0; i < n; i++) {
            printf("%d ", arr[i]);
        }
        printf("\n");
        return 0;
    } else if (pid > 0) { 
        wait(NULL); 
        printf("Parent checking odd/even:\n");
        checkOddEven(arr, n);
    } else { 
        printf("Fork failed");
        return 1;
    }

    return 0;
}