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
using System.Windows.Forms;
using Mono.Security.X509;
using Fleck2;
using Fleck2.Interfaces;
using KeePassRPC.DataExchangeModel;

namespace KeePassRPC
{
    public class KeePassRPCServer
    {
        const char TOKEN_QUOT = '"';
        const char TOKEN_BACKSLASH = '\\';
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
        private System.Security.Cryptography.X509Certificates.X509Store _store = null;
        KeePassRPCExt KeePassRPCPlugin;
        private bool _useSSL = true;
        private string pkcs12_password = "private"; // Really doesn't matter, but required for Mono
		private AutoResetEvent wait_event = null;
        private WebSocketServer _webSocketServer;
		
        private List<Thread> activeClientThreads;

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
        /// Terminates this server.
        /// </summary>
        public void Terminate()
        {
            this._tcpListener.Stop();
            foreach (var thread in activeClientThreads.ToArray()) {
                thread.Interrupt();
            }
			// KRB - there appears to be a race condition here (at least under Mono).
			// The above Stop will signal AcceptTcpClient() in ListenForClients() to exit.
			// However, the thread may not exit until AFTER the main KeePass program
			// has cleaned up its plugins. At that time, our ListenForClientS() thread
			// will still be running and try to access invalid memory causing crashes/fatal exceptions
			
			// The solution is to signal wait for the thread to exit here before we continue.
			// The above Stop() should already trigger an exception in ListenForClients() / AcceptTcpClient(),
			
			// A waitHandle is one method to handle this synchronization.
			if (wait_event != null)
			{
				wait_event.WaitOne();
			}
        }
        
        void StartWebsockServer(int port)
        {
            FleckLog.Level = LogLevel.Debug;
            _webSocketServer = new WebSocketServer("ws://localhost:" + port);
            Action<IWebSocketConnection> config = new Action<IWebSocketConnection>(InitSocket);
            _webSocketServer.Start(config);
        }

        void InitSocket(IWebSocketConnection socket)
        {
            socket.OnOpen = delegate()
            {
                KeePassRPCPlugin.AddRPCClientConnection(socket);
            };
            socket.OnClose = delegate()
            {
                KeePassRPCPlugin.RemoveRPCClientConnection(socket);
            };
            socket.OnMessage = delegate(string message)
            {
                KeePassRPCPlugin.MessageRPCClientConnection(socket, message, Service);
            };
        }

        /// <summary>
        /// Starts the web socket listener and also
        /// establishes the SSL certificate we will use for legacy communication with
        /// RPC clients and starts a seperate thread to listen for legacy connections
        /// </summary>
        /// <param name="port">port to listen on</param>
        /// <param name="service">The KeePassRPCService the server should interact with.</param>
        public KeePassRPCServer(int port, KeePassRPCService service, KeePassRPCExt keePassRPCPlugin, bool useSSL, int webSocketPort)
        {
            _useSSL = useSSL;
            if (keePassRPCPlugin.logger != null) keePassRPCPlugin.logger.WriteLine("Starting KPRPCServer");
            Service = service;
            KeePassRPCPlugin = keePassRPCPlugin;
            activeClientThreads = new List<Thread>();

            // We set up the new web socket server first and then the legacy connection system.
            // KeeFox 1.3+ will connect to the webSocket server first provided that the upgrade has happened...
            /*
             * KF 1.3 checks for KPRPC.plgx, determines KPRPC is installed and tries to connect on websock
             * If success, move on to srp auth
             * If fail, try to connect to ssl port
             * if success, will find one of two situations:
             * 1) old version of KPRPC is running <1.3: Display standard KPRPC setup uprgade notice
             * 2) this version of KPRPC is running but firewalls or port misconfiguration is preventing websocket
             * from working: send a new category of auth failure (assuming client v is 1.3+) message to help user with the upgrade problems
             */
            StartWebsockServer(webSocketPort);

            if (_useSSL)
            {
//                if (true)
                if (Type.GetType("Mono.Runtime") == null)
                {
                    _store = new System.Security.Cryptography.X509Certificates.X509Store();
                    _store.Open(OpenFlags.ReadWrite);

                    // Find any certificates in this user's certificate store and re-use
                    // them rather than suffer the overhead of creating an entirly new
                    // certificate. Our certificates are considered "invalid" by the
                    // store (probably becuase they are self-signed)
                    X509Certificate2Collection matchingCertificates = _store.Certificates
                        .Find(X509FindType.FindBySubjectDistinguishedName,
                            "CN=KeePassRPC certificate for " + Environment.MachineName, false);

                    //foreach (X509Certificate2 temp in matchingCertificates)
                    //    _store.Remove(temp);

                    //matchingCertificates = _store.Certificates
                    //    .Find(X509FindType.FindBySubjectDistinguishedName,
                    //        "CN=KeePassRPC TLS aaa for " + Environment.MachineName, false);

                    if (keePassRPCPlugin.logger != null) keePassRPCPlugin.logger.WriteLine("Matching certificates from store: " + matchingCertificates.Count);
                    if (matchingCertificates.Count > 0)
                        _serverCertificate = matchingCertificates[0];
                    else
                    {
                        //_serverCertificate = (X509Certificate2)X509Certificate2.CreateFromCertFile(Path.Combine(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "KeePassRPC"), "cert.p12"));

                        if (keePassRPCPlugin.logger != null) keePassRPCPlugin.logger.WriteLine("Generating new certificate (MS).");
                        // We can use the MakeCert feature from Mono to generate a new
                        // certificate for use by this user on this machine. This means
                        // that every KeePassRPC user will establish TLS connections
                        // that are protected by a private key held on their own
                        // system, rather than a key that is disclosed in this open
                        // source code. NB: The local server is assumed to be secure!
                        PKCS12 p12 = MakeCertKPRPC.Generate("KeePassRPC certificate for " + Environment.MachineName, "KeePassRPC Automated Self-Signed Key Generator", keePassRPCPlugin);					
						byte[] cert = p12.GetBytes();
                        _serverCertificate = new X509Certificate2(cert, (string)null, X509KeyStorageFlags.PersistKeySet);
                        _store.Add(_serverCertificate);
                    }
                }
                else
                {					
					/*
					 * Problem 1:
					 *   For Linux/Mono, we cannot use the X509Store. It appears that only a .cer file is saved. That certificate does not include
					 *   the private key that we need for SSL. So we will need to save the key ourselves.
					 * 
					 * Problem 2:
					 *   When using PKCS12 SaveToFile to save the key ourselves, it appears that it is not possible to save a private key that is not
					 *   password protected.
					 *
					 */
					string certdir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "KeePassRPC");
					string certfile = Path.Combine(certdir, "cert.p12");
					_serverCertificate = null;
					
					// Check if cert directory exists, if not, we need to create it
					if (!System.IO.Directory.Exists(certdir))
					{
						if (keePassRPCPlugin.logger != null) keePassRPCPlugin.logger.WriteLine("Cert directory does not exist, creating "+certdir);					
						
						System.IO.Directory.CreateDirectory(certdir);

						if (keePassRPCPlugin.logger != null) keePassRPCPlugin.logger.WriteLine("Cert directory created");										
					}
					else 
					{
						// Attempt to load cert			
						try {
		                    if (keePassRPCPlugin.logger != null) keePassRPCPlugin.logger.WriteLine("Looking for existing certificate (Mono)");											
	                    	_serverCertificate = new X509Certificate2();
							_serverCertificate.Import (certfile, pkcs12_password, X509KeyStorageFlags.PersistKeySet);
		                    if (keePassRPCPlugin.logger != null) keePassRPCPlugin.logger.WriteLine("Existing certificate loaded(Mono) : "+certfile);																		
						}
						catch (Exception ex) {
							_serverCertificate = null;
						}
					}
					// If we didn't load a cert, create one and save it
                    if (_serverCertificate == null)
                    {
                        if (keePassRPCPlugin.logger != null) keePassRPCPlugin.logger.WriteLine("Generating new certificate (Mono).");
					
	                	PKCS12 p12 = MakeCertKPRPC.Generate("KeePassRPC certificate for " + Environment.MachineName, "KeePassRPC Automated Self-Signed Key Generator", pkcs12_password, keePassRPCPlugin);					
                    	p12.SaveToFile(certfile);								
						byte[] cert = p12.GetBytes();
                    	_serverCertificate = new X509Certificate2(cert, pkcs12_password, X509KeyStorageFlags.PersistKeySet);					
                        if (keePassRPCPlugin.logger != null) keePassRPCPlugin.logger.WriteLine("Generated new certificate (Mono) : "+certfile);
					}
                }
            }
				
           if (keePassRPCPlugin.logger != null) keePassRPCPlugin.logger.WriteLine("Server certificate has private key? " + _serverCertificate.HasPrivateKey);

            try
            {
                this._tcpListener =  new TcpListener(IPAddress.Loopback, port);
                this._listenThread = new Thread(new ThreadStart(ListenForClients));
                this._listenThread.Name = "KeePassRPCServer._listenThread";
                this._listenThread.Start();
                this._isListening = true; // just in case the main thread checks
                    // for successful startup before the thread has got going.
            }
            catch (Exception e)
            {
                if (keePassRPCPlugin.logger != null) keePassRPCPlugin.logger.WriteLine("Failed to start TCP listener: " + e.ToString());
            }
            if (keePassRPCPlugin.logger != null) keePassRPCPlugin.logger.WriteLine("Started KPRPCServer");
        }

        /// <summary>
        /// Listens for legacy clients (on a unique thread).
        /// </summary>
        private void ListenForClients()
        {
            bool tryToListen = true;
            long lastListenAttempt = 0;
            this.wait_event = new AutoResetEvent(false);
            int connectionThreadCount = 0;

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
                        clientThread.Name = string.Format("KeePassRPCServer - clientThread{0}",
                                                          connectionThreadCount++);
                        clientThread.Start(client);
                        activeClientThreads.Add(clientThread);
                    }
                }
                catch (Exception ex)
                {
                    this._isListening = false;
                    if (KeePassRPCPlugin.logger != null) KeePassRPCPlugin.logger.WriteLine("Error while listening for new connections: " + ex.ToString());
                    // attempt recovery unless we tried less than 3 seconds ago
                    // actually, when this works as describes, it just hangs KP on
                    // exit (while loop keeps this one thread open after main window has shut)
                    // so more work needed if we want to auto-recover reliably.
                    //if (DateTime.UtcNow.Ticks < lastListenAttempt+(10*1000*1000*3))
                        tryToListen = false;								
                }
            }
			
			
            //Close the certificate store.
            if (_useSSL && (_store != null))
			{
                _store.Close();
            	if (KeePassRPCPlugin.logger != null) KeePassRPCPlugin.logger.WriteLine("Cert store closed");
			}
			
			// Signal that this thread is done. This must be the last statement of this function
			this.wait_event.Set();
        }

        /// <summary>
        /// Handles the legacy client communication
        /// </summary>
        /// <param name="client">The client.</param>
        private void HandleClientComm(object client)
        {
            KeePassRPCClientConnection keePassRPCClient = null;
            TcpClient tcpClient = null;
            NetworkStream clientStream = null;
            SslStream sslStream = null;
			
            if (KeePassRPCPlugin.logger != null) KeePassRPCPlugin.logger.WriteLine("HandleClientComm: ");
			
            if (_useSSL)
            {                
                // A client has connected. Create the 
                // SslStream using the client's network stream.
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };
                sslStream = new SslStream(((TcpClient)client).GetStream(), false);//, new RemoteCertificateValidationCallback (ValidateServerCertificate), 
                //    new LocalCertificateSelectionCallback(SelectLocalCertificate)
                //  );
            } else
            {
                tcpClient = (TcpClient)client;
                clientStream = tcpClient.GetStream();
            }

            if (KeePassRPCPlugin.logger != null) KeePassRPCPlugin.logger.WriteLine("stream ready to be authenticated");
            try
            {
                if (_useSSL)
                {
                    // Authenticate the server but don't require the client to
                    // authenticate - we've got our own authentication requirements
                    sslStream.AuthenticateAsServer(
                        _serverCertificate, false, SslProtocols.Ssl3|SslProtocols.Tls, false);
                    if (KeePassRPCPlugin.logger != null) KeePassRPCPlugin.logger.WriteLine("stream authenticated");
                    sslStream.ReadTimeout = -1;
                    sslStream.WriteTimeout = -1;
                }
                else
                {
                    clientStream.ReadTimeout = -1;
                    clientStream.WriteTimeout = -1;
                }

                byte[] message = new byte[4096];
                int bytesRead;
                //bool authorised = false;

                //TODO2: creation of this client probably should happen later
                // but we need to know that this connection needs to be closed
                // during shutdown, even if the client never
                // successfully authenticates.
                keePassRPCClient = _useSSL ? new KeePassRPCClientConnection(sslStream, false) : new KeePassRPCClientConnection(tcpClient, false);
                KeePassRPCPlugin.AddRPCClientConnection(keePassRPCClient);

                // send an "invitation to authenticate" to the new RPC client
                keePassRPCClient.Signal(KeePassRPC.DataExchangeModel.Signal.PLEASE_AUTHENTICATE, "KPRPCListener");

                int tokenCurlyCount = 0;
                int tokenSquareCount = 0;
                int adjacentBackslashCount = 0;
                bool parsingStringContents = false;
                StringBuilder currentJSONPacket = new StringBuilder(50);

                // Keep reading data from the network stream whenever it's available
                while (true)
                {
                    bytesRead = 0;

                    try
                    {
                        //blocks until a client sends a message
                        bytesRead = _useSSL ? sslStream.Read(message, 0, 4096) : clientStream.Read(message, 0, 4096);
                    }
                    catch (Exception ex)
                    {
                        if (KeePassRPCPlugin.logger != null) KeePassRPCPlugin.logger.WriteLine("a socket error has occured:" + ex.ToString());
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
                        bool incrementAdjacentBackslashCount = false;

                        // Use the simple structure of JSON-RPC to extract
                        // complete messages from the network stream
                        switch (receivedData[i])
                        {
                            case TOKEN_QUOT: if (adjacentBackslashCount%2 == 0)
                                    parsingStringContents = parsingStringContents ? false : true;
                                break;
                            case TOKEN_BACKSLASH: incrementAdjacentBackslashCount = true;
                                break;
                            case TOKEN_CURLY_START: if (!parsingStringContents) tokenCurlyCount++;
                                break;
                            case TOKEN_CURLY_END: if (!parsingStringContents) tokenCurlyCount--;
                                break;
                            case TOKEN_SQUARE_START: if (!parsingStringContents) tokenSquareCount++;
                                break;
                            case TOKEN_SQUARE_END: if (!parsingStringContents) tokenSquareCount--;
                                break;
                        }

                        if (incrementAdjacentBackslashCount)
                            adjacentBackslashCount++;
                        else
                            adjacentBackslashCount = 0;

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

                    // If the JSON request is not complete we store what we have already found
                    if (tokenCurlyCount != 0 || tokenSquareCount != 0)
                        currentJSONPacket.Append(receivedData);
                    // http://groups.google.com/group/jayrock/browse_thread/thread/59cf6a58bc63f0df/a7775c3097cf6957?lnk=gst&q=thread+JsonRpcDispatcher+#a7775c3097cf6957
                }
            }
            catch (AuthorisationException authEx)
            {
                // Send a JSON message down the pipe
                byte[] bytes = System.Text.Encoding.UTF8.GetBytes(authEx.AsJSONResult());
                keePassRPCClient.ConnectionStreamWrite(bytes);
            }
            catch (AuthenticationException ex)
            {
                if (KeePassRPCPlugin.logger != null) KeePassRPCPlugin.logger.WriteLine("Authentication exception: " + ex.ToString());
                // Nothing we can do about this since client can't
                // receive messages over an invalid network stream
            }
            catch (Exception e)
            {
                if (KeePassRPCPlugin.logger != null) KeePassRPCPlugin.logger.WriteLine("Unknown exception: " + e.ToString());
                //TODO2: send a JSON message down the pipe
                // ex.AsJSONResult(); 
            }
            finally
            {
                if (KeePassRPCPlugin.logger != null) KeePassRPCPlugin.logger.WriteLine("!!!Hit finally");
                if (keePassRPCClient != null)
                {
                    KeePassRPCPlugin.RemoveRPCClientConnection(keePassRPCClient);
                }
                if (_useSSL)
				{
					try {
                    	sslStream.Close();
					}
					catch (IOException ioex)
					{
						// This is okay
					}
				}
                else 
				{
                    clientStream.Close();
				}
            }
            activeClientThreads.Remove(Thread.CurrentThread);
        }

        /// <summary>
        /// Does some basic authentication checks and then
        /// dispatches to the JayRock RPC system.
        /// </summary>
        /// <param name="message">The JSON-RPC formatted message.</param>
        /// <param name="keePassRPCClient">The client we're communicating with.</param>
        private void DispatchToRPCService(string message, KeePassRPCClientConnection keePassRPCClientConnection)
        {
            if (KeePassRPCPlugin.logger != null) KeePassRPCPlugin.logger.WriteLine("Preparing to dispatch: " + message);
            StringBuilder sb = new StringBuilder();
            string requiredResultRegex = "";
            long authorisationAttemptId = -1;

            if (!keePassRPCClientConnection.Authorised && _authorisationRequired)
            {
                Match match = Regex.Match(message,
                    "^\\{.*?\\\"method\\\"\\:\\\"Idle\\\".*?,.*?\\\"id\\\"\\:(\\d+).*?\\}$");
                if (match.Success)
                {
                    if (KeePassRPCPlugin.logger != null) KeePassRPCPlugin.logger.WriteLine("Got Idle method- ignoring.");
                    // Do nothing
                    return;
                } else // Check for alternative Idle message structure
                {
                    match = Regex.Match(message,
                        "^\\{.*?\\\"id\\\"\\:(\\d+).*?,.*?\\\"method\\\"\\:\\\"Idle\\\".*?\\}$");
                    if (match.Success)
                    {
                        if (KeePassRPCPlugin.logger != null) KeePassRPCPlugin.logger.WriteLine("Got Idle method- ignoring.");
                        // Do nothing
                        return;
                    }
                }
			}
			
            if (!keePassRPCClientConnection.Authorised && _authorisationRequired)
            {
                // We only accept one type of request if the client has not
                // already authenticated. Maybe it's not nice having to do this
                // outside of the main JayRockJsonRpc library but it'll be good enough
                
                Match match = Regex.Match(message,
                    "^\\{.*?\\\"method\\\"\\:\\\"Authenticate\\\".*?,.*?\\\"id\\\"\\:(\\d+).*?\\}$");
                if (!match.Success)
                {
                    match = Regex.Match(message,
                    "^\\{.*?\\\"id\\\"\\:(\\d+).*?,.*?\\\"method\\\"\\:\\\"Authenticate\\\".*?\\}$");
                    if (!match.Success)
                        throw new AuthorisationException("Authentication required. You must send a properly formed JSON Authenticate request before using this connection.", -1, 1);
                }

                authorisationAttemptId = int.Parse(match.Groups[1].Value);
                requiredResultRegex = "^\\{\\\"id\\\"\\:" + authorisationAttemptId + ",\\\"result\\\"\\:\\{\\\"result\\\"\\:0,\\\"name\\\"\\:\\\"(.*)\\\"\\}\\}$";
            }

            //Stream clientStream = keePassRPCClientConnection.ConnectionStream;

            //TODO2: is this Jayrock stuff thread-safe or do I need new instances of the Service each time? 
            JsonRpcDispatcher dispatcher = JsonRpcDispatcherFactory.CreateDispatcher(Service);
            
            dispatcher.Process(new StringReader(message),
                new StringWriter(sb), keePassRPCClientConnection.Authorised);
            string output = sb.ToString();
            //MessageBox.Show("result: " + output);
            if (_authorisationRequired && !keePassRPCClientConnection.Authorised)
            {
                string authenticatedClientName;

                // Process the output from the JsonRpcDispatcher which
                // should tell us if the authorisation was successful
                Match match = Regex.Match(output, requiredResultRegex);
                if (match.Success)
                {
                    authenticatedClientName = match.Groups[1].Value;
                    keePassRPCClientConnection.Authorised = true;
                    KeePassRPCPlugin.PromoteNullRPCClient(keePassRPCClientConnection, authenticatedClientName);
                }
                else
                {
                    // If the result follows an accepted syntax we will send
                    // it back to the client so they know why it failed but otherwise...
                    if (!Regex.IsMatch(output,
                        "^\\{\\\"id\\\"\\:(\\d+),\\\"result\\\"\\:\\{\\\"result\\\"\\:(\\d+),\\\"name\\\"\\:\\\".*\\\"\\}\\}$"))
                    {
                        MessageBox.Show("ERROR! Please click on this box, press CTRL-C on your keyboard and paste into a new post on the KeeFox forum (http://keefox.org/help/forum). Doing this will help other people to use KeeFox without any unexpected error messages like this. Please briefly describe what you were doing when the problem occurred, which version of KeeFox, KeePass and Firefox you use and what other security software you run on your machine. Thanks! Technical detail follows: " + output);
                        return; // maybe could return a proper result indicating failure
                        //but user might get annoyed with this popup appearing every 10 seconds!
                    }
                }
            }

            byte[] bytes = System.Text.Encoding.UTF8.GetBytes(output);
            keePassRPCClientConnection.ConnectionStreamWrite(bytes);
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
