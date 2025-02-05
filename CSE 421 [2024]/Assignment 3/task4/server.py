import socket

port = 5050
buffer = 16
format = "utf-8"
disconnected_msg = "Disconnect"
hostname = socket.gethostname()
host_addr = socket.gethostbyname(hostname)

server_socket_address = (host_addr, port)
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(server_socket_address)

server.listen()
print("Server is listening.....")

def calculate_salary(hours_worked):
    if hours_worked <= 40:
        return hours_worked * 200
    else:
        base_pay = 40 * 200
        overtime_hours = hours_worked - 40
        overtime_pay = overtime_hours * 300
        total_salary = base_pay + 8000 + overtime_pay
        return total_salary

while True:
   conn, addr = server.accept()
   print("Connected to ", addr)
   
   connected = True
   while connected:
       msg_len = conn.recv(buffer).decode(format)
       print("Length of the message ", msg_len)
       if msg_len:
           msg_len = int(msg_len)
           msg = conn.recv(msg_len).decode(format)
           
           if msg == disconnected_msg:
               print("Disconnecting with ", addr)
               conn.send("IT was nice to serve you".encode(format))
               connected = False
           else:
                try:
                    hours = float(msg)
                    salary = calculate_salary(hours)
                    response = f"Salary: Tk {salary}"
                    conn.send(response.encode(format))
                except ValueError:
                    conn.send("Invalid input".encode(format))

   conn.close()