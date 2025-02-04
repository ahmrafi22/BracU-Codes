file= open("input1a.txt","r")

text=file.readlines()
file_2 = open("output1.txt", "a")

x=int(text[0])
for i in range(1,x+1):
  k=int(text[i])
  if k%2==0:
    file_2.write(f'{k} is an even number\n')

  else:
    file_2.write(f'{k} is a odd number\n')
  print()
file_2.close()