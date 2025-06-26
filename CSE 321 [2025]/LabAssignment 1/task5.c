#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>
#include <stdlib.h>
pid_t child, grandchild;
int main() {
    
    printf("1. Parent process ID : 0\n");

   
    pid_t child = fork();

    if (child == 0) { 
        printf("2. Child process ID: %d\n", getpid());

        
        for (int i = 0; i < 3; i++) {
            pid_t grandchild = fork();
            if (grandchild == 0) { 
                printf("%d. Grand Child process ID: %d\n", i + 3, getpid());
                exit(0); 
            } else {
                wait(NULL); 
            }
        }
        exit(0);
    } else {
        wait(NULL);
    }

    return 0;
}