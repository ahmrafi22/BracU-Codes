def mergeSort(arr):
    if len(arr) <= 1:
        return arr
    else:
        mid = len(arr) // 2
        left = arr[:mid]
        right = arr[mid:]
        a1 = mergeSort(left)
        a2 = mergeSort(right)
        return merge(a1, a2)


def merge(l, r):
    arr = []
    i = j = 0

    while i < len(l) and j < len(r):
        if l[i] < r[j]:
            arr.append(l[i])
            i += 1
        else:
            arr.append(r[j])
            j += 1

    while i < len(l):
        arr.append(l[i])
        i += 1

    while j < len(r):
        arr.append(r[j])
        j += 1

    return arr

f1=open("input1.txt", 'r')
a = int(f1.readline())
array = [int(i) for i in f1.readline().split()]

sorted_arr=mergeSort(array)

f2=open("output1.txt", 'w')
for i in range(a):
    f2.write(str(sorted_arr[i]) + " ")