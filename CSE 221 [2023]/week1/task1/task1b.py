file= open("input1b.txt","r")
file_2 = open("output1b.txt", "a")
lis=[]
for i in range(int(file.readline())):
  lis.append(file.readline().split()[1:])

for i in lis:
  if i[1]=="+":
    file_2.write(f"The result of {i[0]} {i[1]} {i[2]} is {int(i[0]) + int(i[2])}\n")
  elif i[1]=="-":
    file_2.write(f"The result of {i[0]} {i[1]} {i[2]} is {int(i[0]) - int(i[2])}\n")
  elif i[1]=="*":
    file_2.write(f"The result of {i[0]} {i[1]} {i[2]} is {int(i[0]) * int(i[2])}\n")
  elif i[1]=="/":
    file_2.write(f"The result of {i[0]} {i[1]} {i[2]} is {int(i[0]) / int(i[2])}\n")

file_2.close()