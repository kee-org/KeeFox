/*
  KeePassRPC - Uses JSON-RPC to provide RPC facilities to KeePass.
  Example usage includes the KeeFox firefox extension.
  
  Copyright 2010 Chris Tomlinson <keefox@christomlinson.name>
  
  This web page helped me write this class:
  http://www.switchonthecode.com/tutorials/csharp-tutorial-simple-threaded-tcp-server

  This program is free software; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation; either version 2 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program; if not, write to the Free Software
  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

using System;
using System.Collections.Generic;
using System.Text;
using Jayrock.JsonRpc;
using System.Diagnostics;
using System.Net.Sockets;
using System.Threading;
using System.Net;
using System.IO;

namespace KeePassRPC
{
    public class KeePassRPCServer
    {
        private TcpListener _tcpListener;
        private Thread _listenThread;
        private static KeePassRPCService Service;
        private bool _isListening = false;

        /// <summary>
        /// Gets a value indicating whether this server is listening for connection requests from clients.
        /// </summary>
        /// <value>
        /// 	<c>true</c> if this server is listening; otherwise, <c>false</c>.
        /// </value>
        public bool IsListening
        {
            get { return _isListening; }
        }

        private static object _lockRPCClients = new object();

        private static List<KeePassRPCClient> _RPCClients = new List<KeePassRPCClient>(1);

        public static void AddRPCClient(KeePassRPCClient client)
        {
            lock (_lockRPCClients)
            {
                _RPCClients.Add(client);
            }
        }

        public static void RemoveRPCClient(KeePassRPCClient client)
        {
            lock (_lockRPCClients)
            {
                _RPCClients.Remove(client);
            }
        }

        /// <summary>
        /// Gets the current RPC clients. ACTUAL client list may change immediately after this array is returned.
        /// </summary>
        /// <value>The current RPC clients.</value>
        public static KeePassRPCClient[] CurrentRPCClients
        {
            get
            {
                lock (_lockRPCClients)
                {
                    KeePassRPCClient[] clients = new KeePassRPCClient[_RPCClients.Count];
                    _RPCClients.CopyTo(clients);
                    return clients;
                }
            }
        }

        /// <summary>
        /// Signals all clients.
        /// </summary>
        /// <param name="signal">The signal.</param>
        public void SignalAllClients(KeePassRPC.DataExchangeModel.Signal signal)
        {
            lock (_lockRPCClients)
            {
                foreach (var client in _RPCClients)
                    client.Signal(signal);
            }
        }

        public void Terminate()
        {
            lock (_lockRPCClients)
            {
                foreach (var client in _RPCClients)
                {
                    client.Signal(KeePassRPC.DataExchangeModel.Signal.EXITING);
                    client.Connection.Client.Close();
                    client.Connection.Close();
                }
                _RPCClients.Clear();
                this._tcpListener.Stop();
            }
        }


        public KeePassRPCServer(int port, KeePassRPCService service)
        {
            Service = service;
            try
            {
                this._tcpListener =  new TcpListener(IPAddress.Loopback, port);
                this._listenThread = new Thread(new ThreadStart(ListenForClients));
                this._listenThread.Start();
                _isListening = true;
            }
            catch (Exception e)
            {
                Console.Error.WriteLine(e.Message);
                Trace.TraceError(e.ToString());
            }

        }

        /// <summary>
        /// Listens for clients (on a unique thread).
        /// </summary>
        private void ListenForClients()
        {
            try
            {
                this._tcpListener.Start();

                while (true)
                {
                    //blocks until a client has connected to the server
                    TcpClient client = this._tcpListener.AcceptTcpClient();

                    //create a thread to handle communication with connected client
                    Thread clientThread = new Thread(new ParameterizedThreadStart(HandleClientComm));
                    clientThread.Start(client);
                }
            }
            catch
            {
                //TODO: attempt recovery without KeePass restart being necessary
                this._isListening = false;
            }
        }

        const byte TOKEN_QUOT = 34;
        const byte TOKEN_CURLY_START = 123;
        const byte TOKEN_CURLY_END = 125;
        const byte TOKEN_SQUARE_START = 91;
        const byte TOKEN_SQUARE_END = 93;

        //TODO: transport level protection could be used or we just base64 encode an encrtyped version of the json-rpc data using a DH-PSK?
        
        private void HandleClientComm(object client)
        {
            KeePassRPCClient keePassRPCClient;

            TcpClient tcpClient = (TcpClient)client;
            NetworkStream clientStream = tcpClient.GetStream();

            byte[] message = new byte[4096];
            int bytesRead;
            //bool authorised = false;

            //TODO: creation of this client probably needs to happen later once we enable crypto features
            //TODO: Need to find a way to set the parameters of this client based on output of the authentication system
            keePassRPCClient = new KeePassRPCClient(tcpClient, "KeeFox", false);
            AddRPCClient(keePassRPCClient);
            
            int tokenCurlyCount = 0;
            int tokenSquareCount = 0;
            bool parsingStringContents = false;
            StringBuilder currentJSONPacket = new StringBuilder(50);

            while (true)
            {
                bytesRead = 0;

                try
                {
                    //blocks until a client sends a message
                    bytesRead = clientStream.Read(message, 0, 4096);
                }
                catch
                {
                    //a socket error has occured
                    break;
                    //continue;
                }

                if (bytesRead == 0)
                {
                    //the client has disconnected from the server
                    break;
                }

                for (int i = 0; i < bytesRead; i++)
                {
                    //TODO: More efficient to track integer index and run the encoding only once on the whole message?
                    currentJSONPacket.Append(System.Text.Encoding.UTF8.GetString(message,i,1));
                    switch (message[i])
                    {
                        case TOKEN_QUOT: parsingStringContents = parsingStringContents ? false : true; break;
                        case TOKEN_CURLY_START: if (!parsingStringContents) tokenCurlyCount++; break;
                        case TOKEN_CURLY_END: if (!parsingStringContents) tokenCurlyCount--; break;
                        case TOKEN_SQUARE_START: if (!parsingStringContents) tokenSquareCount++; break;
                        case TOKEN_SQUARE_END: if (!parsingStringContents) tokenSquareCount--; break;
                    }
                    if (tokenCurlyCount == 0 && tokenSquareCount == 0)
                    {
                        DispatchToRPCService(currentJSONPacket.ToString(), keePassRPCClient);
                        currentJSONPacket = new StringBuilder(50);
                    }
                }
                // http://groups.google.com/group/jayrock/browse_thread/thread/59cf6a58bc63f0df/a7775c3097cf6957?lnk=gst&q=thread+JsonRpcDispatcher+#a7775c3097cf6957
            }
            //TODO: change some flags / data in the RPCClient object?
            RemoveRPCClient(keePassRPCClient);
            tcpClient.Close();
        }


        private void DispatchToRPCService(string message, KeePassRPCClient keePassRPCClient)
        {
            TcpClient tcpClient = keePassRPCClient.Connection;
            StringBuilder sb = new StringBuilder();
            try
            {
                NetworkStream clientStream = tcpClient.GetStream();

                //TODO: is this Jayrock stuff thread-safe or do I need new instances of the Service each time? 
                JsonRpcDispatcher dispatcher = JsonRpcDispatcherFactory.CreateDispatcher(Service);
                
                dispatcher.Process(new StringReader(message), new StringWriter(sb), keePassRPCClient.Authorised);
                string output = sb.ToString();

                if (!keePassRPCClient.Authorised && output == "{\"id\":1,\"result\":0}")
                {
                    keePassRPCClient.Authorised = true;
                }

                byte[] bytes = System.Text.Encoding.UTF8.GetBytes(output);
                clientStream.Write(bytes,0,bytes.Length);
            }
            catch (Exception ex)
            {
                //TODO: catch unauthorised errors, etc.?
                Console.Error.WriteLine(ex.Message);
            }
        }
    }
}
