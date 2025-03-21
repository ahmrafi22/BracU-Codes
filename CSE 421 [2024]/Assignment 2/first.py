from ns import ns

# // Default Network Topology
# //
# //       10.1.1.0
# // n0 -------------- n1
# //    point-to-point
# //

ns.core.LogComponentEnable("UdpEchoClientApplication", ns.core.LOG_LEVEL_INFO)
ns.core.LogComponentEnable("UdpEchoServerApplication", ns.core.LOG_LEVEL_INFO)

nodes = ns.network.NodeContainer()
nodes.Create(2)

pointToPoint = ns.point_to_point.PointToPointHelper()
pointToPoint.SetDeviceAttribute("DataRate", ns.core.StringValue("5Mbps"))
pointToPoint.SetChannelAttribute("Delay", ns.core.StringValue("2ms"))

devices = pointToPoint.Install(nodes)

stack = ns.internet.InternetStackHelper()
stack.Install(nodes)

address = ns.internet.Ipv4AddressHelper()
address.SetBase(ns.network.Ipv4Address("10.1.1.0"),
                ns.network.Ipv4Mask("255.255.255.0"))

interfaces = address.Assign(devices)

echoServer = ns.applications.UdpEchoServerHelper(9)

serverApps = echoServer.Install(nodes.Get(1))
serverApps.Start(ns.core.Seconds(1.0))
serverApps.Stop(ns.core.Seconds(10.0))

address = interfaces.GetAddress(1).ConvertTo()
echoClient = ns.applications.UdpEchoClientHelper(address, 9)
echoClient.SetAttribute("MaxPackets", ns.core.UintegerValue(1))
echoClient.SetAttribute("Interval", ns.core.TimeValue(ns.core.Seconds(1.0)))
echoClient.SetAttribute("PacketSize", ns.core.UintegerValue(128)) # later changed to 256, 512, 1024, 2048



clientApps = echoClient.Install(nodes.Get(0))
clientApps.Start(ns.core.Seconds(2.0))
clientApps.Stop(ns.core.Seconds(10.0))

anim = ns.netanim.AnimationInterface("first.xml")
flowmon_helper = ns.flow_monitor.FlowMonitorHelper()
monitor = flowmon_helper.InstallAll()
monitor = flowmon_helper.GetMonitor()

ns.core.Simulator.Stop(ns.core.Seconds(20.0))
ns.core.Simulator.Run()

def print_stats(st):
    print("Tx Bytes: ", st.txBytes)
    print("Rx Bytes: ", st.rxBytes)
    print("Tx Packets: ", st.txPackets)
    print("Rx Packets: ", st.rxPackets)
    print("Lost Packets: ", st.lostPackets)
    if st.rxPackets > 0:
        print("Mean Delay: ", (st.delaySum.GetSeconds() / st.rxPackets))
        print("Throughput: ", (st.rxBytes*8)/18)
 
monitor.CheckForLostPackets()
classifier = flowmon_helper.GetClassifier()
 
for flow_id, flow_stats in monitor.GetFlowStats():
    t = classifier.FindFlow(flow_id)
    proto = {6: 'TCP', 17: 'UDP'} [t.protocol]
    print ("FlowID: %i (%s %s/%s --> %s/%i)" % \
        (flow_id, proto, t.sourceAddress, t.sourcePort, t.destinationAddress, t.destinationPort))
    print_stats(flow_stats)


#ns.core.Simulator.Run()
ns.core.Simulator.Destroy()