/*
  KeePassRPC - Uses JSON-RPC to provide RPC facilities to KeePass.
  Example usage includes the KeeFox firefox extension.
  
  Copyright 2010 Chris Tomlinson <keefox@christomlinson.name>

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
using System.Net.Sockets;
using System.Net.Security;
using System.IO;

namespace KeePassRPC
{
    /// <summary>
    /// Represents a client that has connected to this RPC server
    /// </summary>
    public class KeePassRPCClientConnection
    {
        /// <summary>
        /// The ID of the next signal we'll send to the client
        /// </summary>
        private int _currentCallBackId = 0;
        private TcpClient _unencryptedConnection;
        private bool _channelIsEncrypted;
        //private string _identifiesAs;
        private bool _authorised;
        private SslStream _encryptedConnection;
        private object streamAccessLock = new object(); // undocumented "The Write method cannot be called
        //when another write operation is pending" errors can be thrown when accessing the stream from
        //multiple threads so this protects against that but also being cautious and assuming
        //similar problems may occur on reading

        /// <summary>
        /// The underlying TCP connection that links us to this client.
        /// </summary>
        public TcpClient UnencryptedConnection
        {
            get { return _unencryptedConnection; }
            private set { _unencryptedConnection = value; }
        }

        /// <summary>
        /// The underlying TLS encrypted TCP connection that links us to this client.
        /// </summary>
        public SslStream EncryptedConnection
        {
            get { return _encryptedConnection; }
            private set { _encryptedConnection = value; }
        }

        /// <summary>
        /// Whether the underlying communications channel is encrypted.
        /// </summary>
        /// <value><c>true</c> if [channel is encrypted]; otherwise, <c>false</c>.</value>
        public bool ChannelIsEncrypted
        {
            get { return _channelIsEncrypted; }
            private set { _channelIsEncrypted = value; }
        }

        /// <summary>
        /// The identification string for this RPC client.
        /// </summary>
        /// <value>The identifies as.</value>
        //public string IdentifiesAs
        //{
        //    get { return _identifiesAs; }
        //    set { _identifiesAs = value; }
        //}

        /// <summary>
        /// Whether this client has successfully authenticated to the
        /// server and been authorised to communicate with KeePass
        /// </summary>
        public bool Authorised
        {
            get { return _authorised; }
            set { _authorised = value; }
        }

        private Stream ConnectionStream
        {
            get
            {
                lock (streamAccessLock)
                {
                    if (ChannelIsEncrypted)
                        return EncryptedConnection;
                    else
                        return UnencryptedConnection.GetStream();
                }
            }
        }

        public void ConnectionStreamWrite(byte[] bytes)
        {
            lock (streamAccessLock)
            {
                this.ConnectionStream.Write(bytes, 0, bytes.Length);
            }
        }

        public void ConnectionStreamRead(byte[] bytes)
        {
            lock (streamAccessLock)
            {
                this.ConnectionStream.Write(bytes, 0, bytes.Length);
            }
        }

        public void ConnectionStreamClose()
        {
            lock (streamAccessLock)
            {
                this.ConnectionStream.Close();
            }
        } 

        public KeePassRPCClientConnection(TcpClient connection, bool isAuthorised)
        {
            ChannelIsEncrypted = false;
            UnencryptedConnection = connection;
            //IdentifiesAs = identifiesAs;
            Authorised = isAuthorised;
        }

        public KeePassRPCClientConnection(SslStream connection, bool isAuthorised)
        {
            ChannelIsEncrypted = true;
            EncryptedConnection = connection;
            //IdentifiesAs = identifiesAs;
            Authorised = isAuthorised;
        }

        /// <summary>
        /// Sends the specified signal to the client.
        /// </summary>
        /// <param name="signal">The signal.</param>
        public void Signal(KeePassRPC.DataExchangeModel.Signal signal, string methodName)
        {
            try
            {
                Jayrock.Json.JsonObject call = new Jayrock.Json.JsonObject();
                call["id"] = ++_currentCallBackId;
                call["method"] = methodName;
                call["params"] = new int[] { (int)signal };

                StringBuilder sb = new StringBuilder();
                Jayrock.Json.Conversion.JsonConvert.Export(call, sb);
                byte[] bytes = System.Text.Encoding.UTF8.GetBytes(sb.ToString());
                this.ConnectionStreamWrite(bytes);
            }
            catch (Exception ex)
            {
                System.Windows.Forms.MessageBox.Show("ERROR! Please click on this box, press CTRL-C on your keyboard and paste into a new post on the KeeFox forum (http://keefox.org/help/forum). Doing this will help other people to use KeeFox without any unexpected error messages like this. Please briefly describe what you were doing when the problem occurred, which version of KeeFox, KeePass and Firefox you use and what other security software you run on your machine. Thanks! Technical detail follows: " + ex.ToString());
            }
        }
    }

    /// <summary>
    /// Tracks requests from RPC clients while they are being authorised
    /// </summary>
    public class PendingRPCClient
    {
        public string ClientId;
        public string Hash;
        public List<string> KnownClientList;

        public PendingRPCClient(string clientId, string hash, List<string> knownClientList)
        {
            ClientId = clientId;
            Hash = hash;
            KnownClientList = knownClientList;
        }
    }

}
