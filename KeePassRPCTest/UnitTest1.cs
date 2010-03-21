using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using KeePassRPC;
using Jayrock.JsonRpc;
using System.Collections;
using Jayrock.Json;
using System.Net;
using System.Net.Sockets;
using System.Diagnostics;
using System.Threading;

namespace KeePassRPCTest
{
    /// <summary>
    /// Summary description for UnitTest1
    /// </summary>
    [TestClass]
    public class UnitTest1
    {
        public UnitTest1()
        {
            //
            // TODO: Add constructor logic here
            //
        }

        private TestContext testContextInstance;

        /// <summary>
        ///Gets or sets the test context which provides
        ///information about and functionality for the current test run.
        ///</summary>
        public TestContext TestContext
        {
            get
            {
                return testContextInstance;
            }
            set
            {
                testContextInstance = value;
            }
        }

        static Process myProcess;

        #region Additional test attributes
        //
        // You can use the following additional attributes as you write your tests:
        //
        // Use ClassInitialize to run code before running the first test in the class
        [ClassInitialize()]
        public static void MyClassInitialize(TestContext testContext) {
            //_service = new KeePassRPCService(host, getStandardIconsBase64(host.MainWindow.ClientIcons));
            //_server = new KeePassRPCServer(12534, _service);

            myProcess = new Process();

            try
            {
                myProcess.StartInfo.UseShellExecute = false;
                // You can start any process, HelloWorld is a do-nothing example.
                myProcess.StartInfo.FileName = @"C:\Program Files (x86)\KeePass Password Safe 2 DEV\KeePass.exe";
                myProcess.StartInfo.Arguments = "-debug -KeePassRPCPort:12534";
                //myProcess.StartInfo.CreateNoWindow = true;
                myProcess.Start();
                Thread.Sleep(5000);
                // This code assumes the process you are starting will terminate itself. 
                // Given that is is started without a window so you cannot terminate it 
                // on the desktop, it must terminate itself or you can do it programmatically
                // from this application using the Kill method.
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }        
        }
        //
        // Use ClassCleanup to run code after all tests in a class have run
        [ClassCleanup()]
        public static void MyClassCleanup() {
            myProcess.Kill();
        }
        //
        // Use TestInitialize to run code before running each test 
        // [TestInitialize()]
        // public void MyTestInitialize() { }
        //
        // Use TestCleanup to run code after each test has run
        // [TestCleanup()]
        // public void MyTestCleanup() { }
        //
        #endregion

        private string handleJSON(string message)
        {
            //
            // TODO: Add test logic	here
            //
            // call some function via JSON-RPC...
            //JsonRpcClient client = new JsonRpcClient();
            TcpClient client = new TcpClient();
            client.Connect("localhost", 12534);
            var stream = client.GetStream();
            stream.Write(System.Text.Encoding.UTF8.GetBytes(message), 0, System.Text.Encoding.UTF8.GetByteCount(message));

            int bytesRead;
            byte[] inmessage = new byte[4096];
            const byte TOKEN_QUOT = 34;
            const byte TOKEN_CURLY_START = 123;
            const byte TOKEN_CURLY_END = 125;
            const byte TOKEN_SQUARE_START = 91;
            const byte TOKEN_SQUARE_END = 93;

            int tokenCurlyCount = 0;
            int tokenSquareCount = 0;
            bool parsingStringContents = false;
            StringBuilder currentJSONPacket = new StringBuilder(50);

            while (true)
            {
                bytesRead = 0;

                try
                {
                    //clientStream.ReadTimeout = 2;
                    //blocks until a client sends a message
                    bytesRead = stream.Read(inmessage, 0, 4096);
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
                    currentJSONPacket.Append(System.Text.Encoding.UTF8.GetString(inmessage, i, 1));
                    switch (inmessage[i])
                    {
                        case TOKEN_QUOT: parsingStringContents = parsingStringContents ? false : true; break;
                        case TOKEN_CURLY_START: if (!parsingStringContents) tokenCurlyCount++; break;
                        case TOKEN_CURLY_END: if (!parsingStringContents) tokenCurlyCount--; break;
                        case TOKEN_SQUARE_START: if (!parsingStringContents) tokenSquareCount++; break;
                        case TOKEN_SQUARE_END: if (!parsingStringContents) tokenSquareCount--; break;
                    }
                    if (tokenCurlyCount == 0 && tokenSquareCount == 0)
                    {
                        return currentJSONPacket.ToString();
                        //currentJSONPacket = new StringBuilder(50);
                    }
                }
            }
            return "error";
        }

        [TestMethod]
        //TODO: implement authentication test
        public void AuthenticateTest()
        {
            string JSONout = handleJSON("{\"jsonrpc\": \"2.0\", \"method\": \"Authenticate\", \"params\": [ [0,7,6,0] , \"base64encoded A(k)\", \"base64encoded X(A(k))\"], \"id\": 1}");
            Assert.AreEqual("{\"id\":1,\"result\":0}", JSONout);
        }

        [TestMethod]
        public void SystemVersionTest()
        {
            string JSONout = handleJSON("{\"jsonrpc\": \"2.0\", \"method\": \"system.version\", \"id\": 1}");
            Assert.AreEqual("{\"id\":1,\"result\":0.9", JSONout.Substring(0,21));
        }

        [TestMethod]
        public void SystemListMethodsTest()
        {
            string JSONout = handleJSON("{\"jsonrpc\": \"2.0\", \"method\": \"system.listMethods\", \"id\": 1}");
            Assert.AreEqual("{\"id\":1,\"result\":[\"GetCurrentKFConfig\",\"GetDatabaseName\""
                + ",\"GetDatabaseFileName\",\"ChangeDatabase\",\"system.listMethods\",\"system.version\",\"system.about\"]}",JSONout);
        }
            
    }
}
