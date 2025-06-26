//gcc -o main task3.c && ./main
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <semaphore.h>
#include <unistd.h>

sem_t sem_id, sem_path;
char filepath[] = "Rafi_24341286/24341286.txt";

void *write_id(void *arg) {
    FILE *file = fopen(filepath, "w");
    fprintf(file, "24341286\n");
    fclose(file);
    sem_post(&sem_path);
    return NULL;
}

void *write_path(void *arg) {
    sem_wait(&sem_path);
    system("pwd >> Rafi_24341286/24341286.txt");
    return NULL;
}

int main() {
    pthread_t thread1, thread2;
    
    system("mkdir -p Rafi_24341286");
    system("touch Rafi_24341286/24341286.txt");
    
    sem_init(&sem_path, 0, 0);
    
    pthread_create(&thread1, NULL, write_id, NULL);
    pthread_create(&thread2, NULL, write_path, NULL);
    
    pthread_join(thread1, NULL);
    pthread_join(thread2, NULL);
    
    sem_destroy(&sem_path);
    
    return 0;
}