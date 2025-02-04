def mergeSort(arr):
    if len(arr) > 1:
        mid = len(arr) // 2
        left = arr[:mid]
        right = arr[mid:]

        left, left_count = mergeSort(left)
        right, right_count = mergeSort(right)
        sorted_arr, c = merge(left, right)

        return sorted_arr, left_count + right_count + c
    else:
        return arr, 0


def merge(l, r):
    arr = []
    i = j = k = 0
    count = 0

    while i < len(l) and j < len(r):
        if l[i] < r[j]:
            arr.append(l[i])
            i += 1
        else:
            arr.append(r[j])
            j += 1
            count += len(l) - i
        k += 1

    while i < len(l):
        arr.append(l[i])
        i += 1
        k += 1

    while j < len(r):
        arr.append(r[j])
        j += 1
        k += 1

    return arr, count


f = open("input3.txt", "r")
n = int(f.readline())
arr = [int(i) for i in f.readline().split()]

arry, count_total = mergeSort(arr)

f2= open("output3.txt", "w")
f2.write(f"{count_total}")
