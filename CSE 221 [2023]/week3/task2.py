def findMax(arr, left, right):
    if left == right:
        return arr[left]
    mid = (left + right) // 2
    max_left = findMax(arr, left, mid)
    max_right = findMax(arr, mid + 1, right)

    if max_left > max_right:
        return max_left
    else:
        return max_right

file1=open("input2.txt", 'r')
a = int(file1.readline())
arr = [int(i) for i in file1.readline().split()]

max_value = findMax(arr, 0, a - 1)

file2=open("output2.txt", 'w')
file2.write(str(max_value))