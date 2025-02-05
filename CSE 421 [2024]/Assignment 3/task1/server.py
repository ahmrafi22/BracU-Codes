import socket

port = 5173
buffer = 16
format = "utf-8"
disconnected_msg = "Disconnect"
hostname = socket.gethostname()
host_addr = socket.gethostbyname(hostname)

server_socket_address = (host_addr, port)
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(server_socket_address)

server.listen()
print("server is listening....")

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
               conn.send("IT was nice to serve youp".encode(format))
               connected = False
           else:
               print(msg)
               conn.send("Received message". encode(format))

   conn.close()