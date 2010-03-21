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

namespace KeePassRPC
{
    /// <summary>
    /// Represents a client that has connected to this RPC server
    /// </summary>
    public class KeePassRPCClient
    {
        /// <summary>
        /// The ID of the next signal we'll send to the client
        /// </summary>
        private int _currentCallBackId = 0;

        /// <summary>
        /// The underlying TCP connection that links us to this client. 
        /// (NB: Maybe need to change this or add seperate connection
        /// variable if we use a TLS encrypted channel)
        /// </summary>
        public TcpClient Connection { get; private set; }

        /// <summary>
        /// CURRENTLY ALWAYS FALSE! Whether the underlying communications channel is encrypted.
        /// </summary>
        /// <value><c>true</c> if [channel is encrypted]; otherwise, <c>false</c>.</value>
        public bool ChannelIsEncrypted { get; private set; }

        /// <summary>
        /// The identification string for this RPC client.
        /// </summary>
        /// <value>The identifies as.</value>
        public string IdentifiesAs { get; private set; }

        /// <summary>
        /// Whether this client has successfully authenticated to the
        /// server and been authorised to communicate with KeePass
        /// </summary>
        public bool Authorised { get; set; }

        public KeePassRPCClient(TcpClient connection, string identifiesAs,
            bool isAuthorised)
        {
            ChannelIsEncrypted = false;
            Connection = connection;
            IdentifiesAs = identifiesAs;
            Authorised = isAuthorised;
        }

        /// <summary>
        /// Sends the specified signal to the client.
        /// </summary>
        /// <param name="signal">The signal.</param>
        public void Signal(KeePassRPC.DataExchangeModel.Signal signal)
        {
            //TODO: check we're in a valid state to do this!

            Jayrock.Json.JsonObject call = new Jayrock.Json.JsonObject();
            call["id"] = ++_currentCallBackId;
            call["method"] = "callBackToKeeFoxJS";
            call["params"] = new int[] {(int)signal};

            StringBuilder sb = new StringBuilder();
            Jayrock.Json.Conversion.JsonConvert.Export(call, sb);
            byte[] bytes = System.Text.Encoding.UTF8.GetBytes(sb.ToString());
            this.Connection.GetStream().Write(bytes, 0, bytes.Length);
        }
    }
}
