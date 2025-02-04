file=open("input4.txt", "r")
N = int(file.readline())
trainTime = []
place = []
file_2 = open("output4.txt", "a")

for line_n in range(N):
    line = file.readline().split(' will departure for ')
    name = line[0]
    time = line[1].split(' at ')[1].strip()
    placeName = line[1].split(' at ')[0]
    place.append(placeName)
    trainTime.append((name, time, line_n))


def compare(schdl1, schdl2):
    name1, time1, line_num1 = schdl1
    name2, time2, line_num2 = schdl2
    if name1 == name2:
        if time1 == time2:
            return line_num1 < line_num2
        return time1 > time2
    return name1 < name2


for i in range(1, len(trainTime)):
    current = trainTime[i]
    j = i - 1
    while j >= 0 and compare(current, trainTime[j]):
        trainTime[j + 1] = trainTime[j]
        j -= 1
    trainTime[j + 1] = current


for schedule in trainTime:
    name, time, serial = schedule
    file_2.write(f"{name} will departure for {place[serial]} at {time}\n")