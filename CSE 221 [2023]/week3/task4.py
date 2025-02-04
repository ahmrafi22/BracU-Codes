def mergeSort(arr):
    if len(arr) > 1:
        mid = len(arr) // 2
        left = arr[:mid]
        right = arr[mid:]

        mergeSort(left)
        mergeSort(right)

        i = j = k = 0

        while i < len(left) and j < len(right):
            if left[i] < right[j]:
                arr[k] = left[i]
                i += 1
            else:
                arr[k] = right[j]
                j += 1
            k += 1

        while i < len(left):
            arr[k] = left[i]
            i += 1
            k += 1

        while j < len(right):
            arr[k] = right[j]
            j += 1
            k += 1

        return arr

    else:
        return arr


def max_what(ar):
    arr = mergeSort(ar)
    max_val = float("-inf")
    max_index = -1
    n = len(arr)

    for i in range(n):
        if arr[i] > max_val:
            max_val = arr[i]
            max_index = i

    summ = float("-inf")

    if arr[0] > 0:
        for i in range(n):
            if i != max_index:
                if arr[i] ** 2 + max_val > summ:
                    summ = arr[i] ** 2 + max_val
    else:
        for i in range(n):
            if i != max_index:
                if arr[i] < 0:
                    if arr[i] ** 2 + max_val > summ:
                        summ = arr[i] ** 2 + max_val
                    if arr[i] + max_val ** 2 > summ:
                        summ = arr[i] + max_val ** 2

    return summ


f1 = open("input4.txt", "r")
n = int(f1.readline())
arr = [int(i) for i in f1.readline().split()]

f2 = open("output4.txt", "w")
f2.write(f"{max_what(arr)}")
