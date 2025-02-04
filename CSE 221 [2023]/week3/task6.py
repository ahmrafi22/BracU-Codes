
def partition(arr, low, high):
  pivot = arr[high]
  i = low - 1
  for j in range(low, high):
    if arr[j] <= pivot:
      i = i + 1
      (arr[i], arr[j]) = (arr[j], arr[i])
  (arr[i + 1], arr[high]) = (arr[high], arr[i + 1])
  return i + 1

def quickSelect(arr, low, high, k):
  index = partition(arr, low, high)

  if index == k - 1:
    return arr[index]

  elif index > k - 1:
    return quickSelect(arr, low, index - 1, k)

  else:
    return quickSelect(arr, index + 1, high, k)


f1=open("input6.txt", "r")
size = int(f1.readline())
arr = [int(i) for i in f1.readline().split()]
queNum = int(f1.readline())
queList = [None] * queNum
for i in range (queNum):
  queList[i] = int(f1.readline())


resList = [None]*queNum
for i in range(queNum):
  resList[i] = quickSelect(arr, 0, size-1, queList[i])


f2=open("output6.txt", "w")
f2.write('\n'.join(map(str,resList)))