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
print("Server is listening....")

while True:
   conn, addr = server.accept()
   print("Connected to ",addr)
   
   connected = True
   while connected:
       mg_len = conn.recv(buffer).decode(format)
       print("Length of the message ", mg_len)
       if mg_len:
           mg_len = int(mg_len)
           msg = conn.recv(mg_len).decode(format)
           
           if msg == disconnected_msg:
               print("Disconnecting with ", addr)
               conn.send("IT was nice to serve you".encode(format))
               connected = False
           else:
                vowels = "aeiouAEIOU"
                count = 0
                for i in msg:
                   if i in vowels:
                       count += 1

                if count == 0:
                    conn.send("Not enough vowels".encode(format))
                elif count <=2:
                    conn.send("Enough vowels I guess".encode(format))
                else:
                   conn.send("Too many vowels".encode(format))


   conn.close()