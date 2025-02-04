file_1 = open("input1.txt", "r")
temp = file_1.readline().split()
n, t_sum = int(temp[0]), int(temp[1])
arr = [int(i) for i in file_1.readline().split()]
file_2= open("output.txt", 'w')

def Find_target_sum(arr, n, target_sum):
    indexDict = {}

    for i in range(len(arr)):
        indexDict[arr[i]] = i + 1

    temp_arr = arr

    start = 0
    end = n - 1

    while start < end:
        current_sum = temp_arr[start] + temp_arr[end]

        if current_sum > target_sum:
            end -= 1
        elif current_sum < target_sum:
            start += 1
        else:
            elem1 = temp_arr[start]
            elem2 = temp_arr[end]

            index1 = indexDict[elem1]
            index2 = indexDict[elem2]

            if index1 > index2:
                file_2.write(f"{index2} {index1}")
            else:
                file_2.write(f"{index1} {index2}")
            return

    file_2.write("Impossible")
    file_2.close()


Find_target_sum(arr, n, t_sum)
