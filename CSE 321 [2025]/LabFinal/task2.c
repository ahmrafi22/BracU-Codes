//gcc -o main task2.c && ./main
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/wait.h> 

int main(){
    pid_t child_pid, grandchild_pid;
    int status; 
    child_pid = fork();

    if (child_pid < 0) {
        perror("Fork failed");
        exit(1);

    } else if (child_pid == 0) { 
        grandchild_pid = fork();
        if (grandchild_pid < 0) {
            perror("Fork failed");
            exit(1);

        } else if (grandchild_pid == 0) { 
            pid_t child_id = getppid(); 
            pid_t grandchild_id = getpid(); 

            if (grandchild_id % child_id == 0) {
                printf("Hello the reminder is Even\n"); 
            } else {
                printf("Hello the reminder is ODD\n");
            }

        } else { 
            wait(&status);
        }

    } else { 
        wait(&status); 
    }
    return 0; 
}
