file= open("input3.txt","r")
r= int(file.readline())
studentIDs = list(map(int, file.readline().split()))
marks = list(map(int, file.readline().split()))
file_2 = open("output3.txt", "a")

data = [(studentIDs[i], marks[i], i) for i in range(r)] #a list of tuples where each tuple contains (studentID, mark, index)

def custom_sort(item):
    return (-item[1], item[0])

data.sort(key=custom_sort)                           #Sort the list of tuples based on the custom sorting functio

sorted_studentIDs = [item[0] for item in data]
sorted_marks = [item[1] for item in data]

for i in range(r):
    file_2.write(f"ID: {sorted_studentIDs[i]} Mark: {sorted_marks[i]}\n")







file_2.close()