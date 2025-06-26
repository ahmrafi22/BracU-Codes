#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>

int process_count = 1;  
pid_t a, b, c , new_child;

void create_child_process() {
    process_count++;  
    
    if (getpid() % 2 != 0) {
        pid_t new_child = fork();
        if (new_child == 0) {  
            process_count++;
        }
    }
}

int main() {

    pid_t a = fork(); 
    if (a == 0) { 
        create_child_process();
        return 0;  
    }

    pid_t b = fork();  
    if (b == 0) {  
        create_child_process();
        return 0;  
    }

    pid_t c = fork();  
    if (c == 0) { 
        create_child_process();
        return 0;  
    }


    while (wait(NULL) > 0);


    printf("Total number of processes created: %d\n", process_count);

    return 0;
}
