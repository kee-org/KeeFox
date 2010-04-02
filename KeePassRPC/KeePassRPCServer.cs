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
using System.Security.Cryptography.X509Certificates;
using System.Net.Security;
using System.Security.Authentication;
using Mono.Tools;
using System.Text.RegularExpressions;
using Jayrock.Json;

namespace KeePassRPC
{
    public class KeePassRPCServer
    {
        const char TOKEN_QUOT = '"';
        const char TOKEN_CURLY_START = '{';
        const char TOKEN_CURLY_END = '}';
        const char TOKEN_SQUARE_START = '[';
        const char TOKEN_SQUARE_END = ']';
      
        private TcpListener _tcpListener;
        private Thread _listenThread;
        private static KeePassRPCService Service;
        private bool _isListening = false;
        private bool _authorisationRequired = true;
        private static X509Certificate2 _serverCertificate = null;
        private X509Store _store;
        private static object _lockRPCClients = new object();
        private static List<KeePassRPCClient> _RPCClients = new List<KeePassRPCClient>(1);

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

        /// <summary>
        /// Adds an RPC client.
        /// </summary>
        /// <param name="client">The client.</param>
        public static void AddRPCClient(KeePassRPCClient client)
        {
            lock (_lockRPCClients)
            {
                _RPCClients.Add(client);
            }
        }

        /// <summary>
        /// Removes an RPC client.
        /// </summary>
        /// <param name="client">The client.</param>
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
                foreach (KeePassRPCClient client in _RPCClients)
                    client.Signal(signal);
            }
        }

        /// <summary>
        /// Terminates this server.
        /// </summary>
        public void Terminate()
        {
            lock (_lockRPCClients)
            {
                foreach (KeePassRPCClient client in _RPCClients)
                {
                    client.Signal(KeePassRPC.DataExchangeModel.Signal.EXITING);
                    client.ConnectionStream.Close();
                }
                _RPCClients.Clear();
                this._tcpListener.Stop();
            }
        }

        /// <summary>
        /// Establishes the SSL certificate we will use for communication with
        /// RPC clients and starts a seperate thread to listen for connections
        /// </summary>
        /// <param name="port">port to listen on</param>
        /// <param name="service">The KeePassRPCService the server should interact with.</param>
        public KeePassRPCServer(int port, KeePassRPCService service)
        {
            Service = service;

            _store = new X509Store();
            _store.Open(OpenFlags.ReadWrite);

            // Find any certificates in this user's certificate store and re-use
            // them rather than suffer the overhead of creating an entirly new
            // certificate. Our certificates are considered "invalid" by the
            // store (probably becuase they are self-signed)
            X509Certificate2Collection matchingCertificates = _store.Certificates
                .Find(X509FindType.FindBySubjectDistinguishedName,
                    "CN=KeePassRPC TLS for " + Environment.MachineName, false);

            if (matchingCertificates.Count > 0)
                _serverCertificate = matchingCertificates[0];
            else
            {
                // We can use the MakeCert feature from Mono to generate a new
                // certificate for use by this user on this machine. This means
                // that every KeePassRPC user will establish TLS connections
                // that are protected by a private key held on their own
                // system, rather than a key that is disclosed in this open
                // source code. NB: The local server is assumed to be secure!
                byte[] cert = MakeCert.Generate("KeePassRPC TLS for " + Environment.MachineName, "KeePassRPC Automated Self-Signed Key Generator");
                _serverCertificate = new X509Certificate2(cert);
                _store.Add(_serverCertificate);
            }

            try
            {
                this._tcpListener =  new TcpListener(IPAddress.Loopback, port);
                this._listenThread = new Thread(new ThreadStart(ListenForClients));
                this._listenThread.Start();
                this._isListening = true; // just in case the main thread checks
                    // for successful startup before the thread has got going.
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
            bool tryToListen = true;
            long lastListenAttempt = 0;

            // Keep listening even if the connection drops out occasionally
            while (tryToListen)
            {
                try
                {
                    // 100-nanosecond intervals is plenty accurate enough for us
                    lastListenAttempt = DateTime.UtcNow.Ticks;
                    this._isListening = true;
                    this._tcpListener.Start();

                    while (true)
                    {
                        //blocks until a client has connected to the server
                        TcpClient client = this._tcpListener.AcceptTcpClient();

                        //create a thread to handle communication with connected client
                        Thread clientThread = new Thread(
                            new ParameterizedThreadStart(HandleClientComm));
                        clientThread.Start(client);
                    }
                }
                catch
                {
                    this._isListening = false;

                    // attempt recovery unless we tried less than 3 seconds ago
                    if (DateTime.UtcNow.Ticks > lastListenAttempt+(10*1000*1000*3))
                        tryToListen = false;
                }
            }

            //Close the certificate store.
            _store.Close();
        }

        /// <summary>
        /// Handles the client communication
        /// </summary>
        /// <param name="client">The client.</param>
        private void HandleClientComm(object client)
        {
            KeePassRPCClient keePassRPCClient = null;

            // TODO: (optionaly) support unencrypted connections in future?
            //TcpClient tcpClient = (TcpClient)client;
            //NetworkStream clientStream = tcpClient.GetStream();

            // A client has connected. Create the 
            // SslStream using the client's network stream.
            SslStream sslStream = new SslStream(((TcpClient)client).GetStream(), false);

            try
            {
                // Authenticate the server but don't require the client to
                // authenticate - we've got our own authentication requirements
                sslStream.AuthenticateAsServer(
                    _serverCertificate, false, SslProtocols.Tls, true);

                sslStream.ReadTimeout = -1;
                sslStream.WriteTimeout = -1;

                byte[] message = new byte[4096];
                int bytesRead;
                //bool authorised = false;

                //TODO: creation of this client probably needs to happen later
                // but we need to know that this connection needs to be closed
                // during shutdown, even if the client never
                // successfully authenticates.
                //TODO: Need to find a way to set the name of this client based
                // on output of the authentication system
                keePassRPCClient = new KeePassRPCClient(sslStream, "KeeFox", false);
                AddRPCClient(keePassRPCClient);

                int tokenCurlyCount = 0;
                int tokenSquareCount = 0;
                bool parsingStringContents = false;
                StringBuilder currentJSONPacket = new StringBuilder(50);

                // Keep reading data from the network stream whenever it's available
                while (true)
                {
                    bytesRead = 0;

                    try
                    {
                        //blocks until a client sends a message
                        bytesRead = sslStream.Read(message, 0, 4096);
                    }
                    catch
                    {
                        //a socket error has occured
                        break;
                    }

                    if (bytesRead == 0)
                    {
                        //the client has disconnected from the server
                        break;
                    }

                    // Can we ever receive a partial UTF8 character? if so, this could go wrong, albeit rarely
                    string receivedData = System.Text.Encoding.UTF8.GetString(message, 0, bytesRead);
                    int jsonPacketStartIndex = 0;

                    for (int i = 0; i < receivedData.Length; i++)
                    {
                        // Use the simple structure of JSON-RPC to extract
                        // complete messages from the network stream
                        switch (receivedData[i])
                        {
                            case TOKEN_QUOT: parsingStringContents = parsingStringContents ? false : true; break;
                            case TOKEN_CURLY_START: if (!parsingStringContents) tokenCurlyCount++; break;
                            case TOKEN_CURLY_END: if (!parsingStringContents) tokenCurlyCount--; break;
                            case TOKEN_SQUARE_START: if (!parsingStringContents) tokenSquareCount++; break;
                            case TOKEN_SQUARE_END: if (!parsingStringContents) tokenSquareCount--; break;
                        }

                        // When both counts are zero, we know we have
                        // reached the end of a JSON-RPC request
                        if (tokenCurlyCount == 0 && tokenSquareCount == 0)
                        {
                            currentJSONPacket.Append(receivedData.Substring(
                                jsonPacketStartIndex, i - jsonPacketStartIndex + 1));
                            DispatchToRPCService(currentJSONPacket.ToString(), keePassRPCClient);
                            currentJSONPacket = new StringBuilder(50);
                            jsonPacketStartIndex = i + 1;
                        }
                    }
                    // http://groups.google.com/group/jayrock/browse_thread/thread/59cf6a58bc63f0df/a7775c3097cf6957?lnk=gst&q=thread+JsonRpcDispatcher+#a7775c3097cf6957
                }
            }
            catch (AuthorisationException authEx)
            {
                // Send a JSON message down the pipe
                byte[] bytes = System.Text.Encoding.UTF8.GetBytes(authEx.AsJSONResult());
                keePassRPCClient.ConnectionStream.Write(bytes, 0, bytes.Length);
            }
            catch (AuthenticationException e)
            {
                // Nothing we can do about this since client can't
                // receive messages over an invalid network stream
            }
            catch (Exception ex)
            {
                //TODO: send a JSON message down the pipe
                // ex.AsJSONResult(); 
            }
            finally
            {
                //TODO: change some flags / data in the RPCClient object?
                if (keePassRPCClient != null)
                    RemoveRPCClient(keePassRPCClient);
                sslStream.Close();
            }
        }

        /// <summary>
        /// Does some basic authentication checks and then
        /// dispatches to the JayRock RPC system.
        /// </summary>
        /// <param name="message">The JSON-RPC formatted message.</param>
        /// <param name="keePassRPCClient">The client we're communicating with.</param>
        private void DispatchToRPCService(string message, KeePassRPCClient keePassRPCClient)
        {
            StringBuilder sb = new StringBuilder();
            string requiredResultString = "";
            long authorisationAttemptId = -1;

            if (!keePassRPCClient.Authorised && _authorisationRequired)
            {
                // We only accept one type of request if the client has not
                // already authenticated. Maybe it's not nice having to do this
                // outside of the main JayRockJsonRpc library but it'll be good enough
                
                //TODO: Make json parameter order irrelevant
                Match match = Regex.Match(message,
                    "^\\{.*?\\\"method\\\"\\:\\\"Authenticate\\\",\\\"id\\\"\\:(\\d+).*?\\}$");

                if (!match.Success)
                    throw new AuthorisationException("Authorisation required. You must send a properly formed JSON Authorisation request before using this connection. (s, not z)", -1, 1);

                authorisationAttemptId = int.Parse(match.Groups[1].Value);
                requiredResultString = "{\"id\":" + authorisationAttemptId + ",\"result\":0}";
            }

            Stream clientStream = keePassRPCClient.ConnectionStream;

            //TODO: is this Jayrock stuff thread-safe or do I need new instances of the Service each time? 
            JsonRpcDispatcher dispatcher = JsonRpcDispatcherFactory.CreateDispatcher(Service);
            
            dispatcher.Process(new StringReader(message),
                new StringWriter(sb), keePassRPCClient.Authorised);
            string output = sb.ToString();

            if (_authorisationRequired && !keePassRPCClient.Authorised)
            {
                // Process the output from the JsonRpcDispatcher which
                // should tell us if the authorisation was successful
                if (output == requiredResultString)
                    keePassRPCClient.Authorised = true;
                else
                {
                    // If the result follows an accepted syntax we will send
                    // it back to the client so they know why it failed
                    if (!Regex.IsMatch(output,
                    "^\\{\\\"result\\\"\\:(\\d+),\\\"id\\\"\\:(\\d+)\\}$"))
                        return;
                }
            }

            byte[] bytes = System.Text.Encoding.UTF8.GetBytes(output);
            clientStream.Write(bytes,0,bytes.Length);
        }
    }

    /// <summary>
    /// Represents a problem with Authorisation (not really used yet)
    /// </summary>
    public class AuthorisationException : Exception
    {
        public long Id;
        public long Result;

        public AuthorisationException(string message, long id, long result)
            : base(message)
        {
            Id = id;
            Result = result;
        }

        public string AsJSONResult()
        {
            return "{\"id\":" + Id + ",\"result\":" + Result + "}";
        }
    }
}
