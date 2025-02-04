file= open("input2.txt","r")
num = int(file.readline())
arr = file.readline().split()
file_2 = open("output2.txt", "a")
for i in range(len(arr) - 1):
  if int(arr[i]) > int(arr[i + 1]):
    continue                             # If the (i)th element is greater than the (i+1)th element, continue to the next iteration without doing anything
  else:
    for j in range(len(arr) - i - 1):    #When (i)th < (i+1)th element found, iterate rest to sort properkly.
      if int(arr[j]) > int(arr[j + 1]):
        arr[j], arr[j + 1] = arr[j + 1], arr[j]

                                         #This modification should have time complexity is θ(n) for the best-case scenario.

for i in arr:
    file_2.write(str(i)+' ')


file_2.close()