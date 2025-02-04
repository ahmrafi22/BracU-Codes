file1= open("input2.txt", 'r')
a = int(file1.readline())
arr1 = [int(i) for i in file1.readline().split()]
b = int(file1.readline())
arr2 = [int(i) for i in file1.readline().split()]

def merge(arr1, arr2, a, b):
        file_2=open("output2.txt", 'w')
        arr = [None]*(a+b)
        i = j = k = 0
        while i < a and j < b:
            if arr1[i] < arr2[j]:
                arr[k] = arr1[i]
                i += 1
            else:
                arr[k] = arr2[j]
                j += 1
            k += 1

        while i < a:
            arr[k] = arr1[i]
            i += 1
            k += 1

        while j < b:
            arr[k] = arr2[j]
            j += 1
            k += 1

        temp = ""
        for i in arr:
            temp += str(i) + " "

        file_2.write(temp)
        file_2.close()



merge(arr1, arr2, a, b)