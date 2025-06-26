#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <semaphore.h>
#include <unistd.h>
#include <time.h>

#define NUM_STUDENTS 10
#define NUM_CHAIRS 3

sem_t student_ready_sem;
sem_t tutor_ready_sem;

pthread_mutex_t lock;

int students_waiting = 0;
int students_served = 0;
int students_left = 0;

void *tutor_code(void *arg);
void *student_code(void *arg);


int main() {
    pthread_t tutor_thread;
    pthread_t student_threads[NUM_STUDENTS];
    int student_ids[NUM_STUDENTS];

    srand(time(NULL));

    if (pthread_mutex_init(&lock, NULL) != 0) {
        perror("Mutex init failed");
        return 1;
    }

    if (sem_init(&student_ready_sem, 0, 0) != 0) {
        perror("Student semaphore init failed");
        pthread_mutex_destroy(&lock);
        return 1;
    }
     if (sem_init(&tutor_ready_sem, 0, 0) != 0) {
        perror("Tutor semaphore init failed");
        sem_destroy(&student_ready_sem);
        pthread_mutex_destroy(&lock);
        return 1;
    }

    printf("Simulation Started: %d chairs, %d students\n", NUM_CHAIRS, NUM_STUDENTS);

    if (pthread_create(&tutor_thread, NULL, tutor_code, NULL) != 0) {
        perror("Tutor thread creation failed");
        sem_destroy(&student_ready_sem);
        sem_destroy(&tutor_ready_sem);
        pthread_mutex_destroy(&lock);
        return 1;
    }

    for (int i = 0; i < NUM_STUDENTS; i++) {
        student_ids[i] = i;
        if (pthread_create(&student_threads[i], NULL, student_code, &student_ids[i]) != 0) {
            fprintf(stderr, "Error creating student thread %d\n", i);
        }
    }

    for (int i = 0; i < NUM_STUDENTS; i++) {
         if (student_threads[i] != 0) {
            pthread_join(student_threads[i], NULL);
         }
    }

    pthread_join(tutor_thread, NULL);

    printf("_______________________________\n");
    printf("Students Served: %d\n", students_served);

    pthread_mutex_destroy(&lock);
    sem_destroy(&student_ready_sem);
    sem_destroy(&tutor_ready_sem);

    return 0;
}

void *tutor_code(void *arg) {

    while (1) {
        pthread_mutex_lock(&lock);
        if (students_served + students_left >= NUM_STUDENTS) {
            pthread_mutex_unlock(&lock);
            break;
        }
        pthread_mutex_unlock(&lock);

        if(sem_wait(&student_ready_sem) != 0){
             perror("Tutor failed waiting for student");
             break;
        }

        pthread_mutex_lock(&lock);
        students_waiting--;
        printf("A waiting student started getting consultation\n");
        printf("Number of students now waiting: %d\n", students_waiting);
        pthread_mutex_unlock(&lock);

        sem_post(&tutor_ready_sem);

        printf("ST giving consultation\n");
        sleep(rand() % 3 + 1);

        pthread_mutex_lock(&lock);
        students_served++;
        pthread_mutex_unlock(&lock);

    }

    printf("Tutor finished work.\n");
    return NULL;
}


void *student_code(void *arg) {
    int id = *(int*)arg;

    sleep(rand() % 10 + 1);

    pthread_mutex_lock(&lock);

    if (students_waiting < NUM_CHAIRS) {
        students_waiting++;
        printf("Student %d started waiting for consultation\n", id);
        printf("Number of students now waiting: %d\n", students_waiting);
        pthread_mutex_unlock(&lock);

        sem_post(&student_ready_sem);

        sem_wait(&tutor_ready_sem);

        printf("Student %d is getting consultation\n", id);
        sleep(rand() % 3 + 1);

        printf("Student %d finished getting consultation and left\n", id);

    } else {
        printf("No chairs remaining in lobby. Student %d Leaving.....\n", id);
        students_left++;
        pthread_mutex_unlock(&lock);
    }

    return NULL;
}