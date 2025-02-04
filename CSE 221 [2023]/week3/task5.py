def partition(array, low, high):
  pivot = array[high]
  i = low - 1
  for j in range(low, high):
    if array[j] <= pivot:
      i = i + 1
      (array[i], array[j]) = (array[j], array[i])
  (array[i + 1], array[high]) = (array[high], array[i + 1])
  return i + 1

def quickSort(array, low, high):
  if low < high:
    pi = partition(array, low, high)
    quickSort(array, low, pi - 1)
    quickSort(array, pi + 1, high)

f1= open("input5.txt", "r")
size = int(f1.readline())
array = [int(i) for i in f1.readline().split()]

quickSort(array, 0, size-1)

f2 =open("output5.txt", "w")
f2.write(' '.join(map(str,array)))