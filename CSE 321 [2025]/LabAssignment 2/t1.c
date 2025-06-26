#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>

typedef struct {
    int max_term;
    long long *sequence;
} FibData;

typedef struct {
    long long *sequence;
    int max_index;
    int *search_indices;
    long long *results;
    int num_searches;
} SearchData;

void* fibonacci_generator(void* arg) {
    FibData* data = (FibData*)arg;
    int n = data->max_term;

    data->sequence = (long long*)malloc((n+1) * sizeof(long long));

    data->sequence[0] = 0;
    if (n >= 1)
        data->sequence[1] = 1;

    for (int i = 2; i <= n; i++) {
        data->sequence[i] = data->sequence[i-1] + data->sequence[i-2];
    }

    pthread_exit(NULL);
}

void* fibonacci_searcher(void* arg) {
    SearchData* data = (SearchData*)arg;

    for (int i = 0; i < data->num_searches; i++) {
        int idx = data->search_indices[i];
        if (idx >= 0 && idx <= data->max_index) {
            data->results[i] = data->sequence[idx];
        } else {
            data->results[i] = -1;
        }
    }

    pthread_exit(NULL);
}

int main() {
    int n, num_searches;
    pthread_t gen_thread, search_thread;

    printf("Enter the term of fibonacci sequence (0-40) : ");
    scanf("%d", &n);

    if (n < 0 || n > 40) {
        printf("Error: Term must be between 0 and 40\n");
        return 1;
    }

    printf("How many numbers you are willing to search?: ");
    scanf("%d", &num_searches);

    if (num_searches <= 0) {
        printf("Error: Number of searches must be greater than 0\n");
        return 1;
    }

    int* search_indices = (int*)malloc(num_searches * sizeof(int));
    long long* search_results = (long long*)malloc(num_searches * sizeof(long long));

    for (int i = 0; i < num_searches; i++) {
        printf("Enter search %d: ", i+1);
        scanf("%d", &search_indices[i]);
    }

    FibData fib_data;
    fib_data.max_term = n;

    pthread_create(&gen_thread, NULL, fibonacci_generator, &fib_data);
    pthread_join(gen_thread, NULL);

    SearchData search_data;
    search_data.sequence = fib_data.sequence;
    search_data.max_index = n;
    search_data.search_indices = search_indices;
    search_data.results = search_results;
    search_data.num_searches = num_searches;

    pthread_create(&search_thread, NULL, fibonacci_searcher, &search_data);
    pthread_join(search_thread, NULL);

    printf("\nGenerated Fibonacci Sequence:\n");
    for (int i = 0; i <= n; i++) {
        printf("a[%d] = %lld\n", i, fib_data.sequence[i]);
    }

    printf("\nSearch Results:\n");
    for (int i = 0; i < num_searches; i++) {
        printf("result of search #%d = %lld\n", i+1, search_results[i]);
    }

    free(fib_data.sequence);
    free(search_indices);
    free(search_results);

    return 0;
}
