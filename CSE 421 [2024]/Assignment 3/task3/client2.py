import socket

port = 5070
data = 16
format = "utf-8"
end_msg = "Disconnect"
hostname = socket.gethostname()
host_addr = socket.gethostbyname(hostname)

server_socket_address = (host_addr, port)
client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect(server_socket_address)

def msg_send(msg):
   message = msg.encode(format)
   msg_length = len(message)
   msg_length = str(msg_length).encode(format)
   msg_length += b" "* (data - len(msg_length))

   client.send(msg_length)
   client.send(message)

   print(client.recv(2048).decode(format))


while True:
   promt = input("Please enter something: ")
   if promt == "End":
      msg_send(end_msg)
      break
   else:
      msg_send(promt)
