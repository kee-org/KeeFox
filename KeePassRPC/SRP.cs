using System;
using System.Collections.Generic;
using System.Text;
using KeePassRPC.DataExchangeModel;

namespace KeePassRPC
{
    class SRP
    {
        public BigInteger N { get; private set; }
        public string Nstr { get; private set; }
        public BigInteger g { get; private set; }
        public string gHex { get; private set; }
        public BigInteger k { get; private set; }
        public string K { get; private set; }
        public BigInteger x { get; private set; }
        public BigInteger v { get; private set; }
        public string s { get; private set; }
        public string I { get; private set; }
        public BigInteger B { get; private set; }
        public string Bstr { get; private set; }
        public BigInteger b { get; private set; }
        private BigInteger S;
        public string M, M2;

        public bool Authenticated { get; private set; }

        // If someone wants to use the session key for encrypting traffic, they can
        // access the key with this property.
        public string Key
        {
            get
            {
                if (K == null)
                {
                    if (Authenticated)
                    {
                        K = KeePassLib.Utility.MemUtil.ByteArrayToHexString(Utils.Hash(S.ToString(16))).ToLower();
                        return K;
                    }
                    else
                        throw new System.Security.Authentication.AuthenticationException("User has not been authenticated.");
                }
                else
                    return K;
            }
        }

        public SRP()
        {
            Nstr = "d4c7f8a2b32c11b8fba9581ec4ba4f1b04215642ef7355e37c0fc0443ef756ea2c6b8eeb755a1c723027663caa265ef785b8ff6a9b35227a52d86633dbdfca43";
            N = new BigInteger(Nstr, 16);
            g = new BigInteger(2);
            k = new BigInteger("b7867f1299da8cc24ab93e08986ebc4d6a478ad0", 16);
        }

        internal void CalculatePasswordHash(string password)
        {
            BigInteger sTemp = new BigInteger();
            sTemp.genRandomBits(256, new Random((int)DateTime.Now.Ticks));
            s = sTemp.ToString();
            x = new BigInteger(Utils.Hash(s + password));
            v = g.modPow(x, N);
        }

        internal void Setup()
        {
            b = new BigInteger();
            b.genRandomBits(256, new Random((int)DateTime.Now.Ticks));

            B = (k * v) + (g.modPow(b, N));
            while (B % N == 0)
            {
                b.genRandomBits(256, new Random((int)DateTime.Now.Ticks));
                B = (k * v) + (g.modPow(b, N));
            }
            Bstr = B.ToString(16);
        }

        // Send salt to the client and store the parameters they sent to us
        internal Error Handshake(string I, string Astr)
        {
            this.I = I;
            return Calculations(Astr, v);
        }

        // Calculate S, M, and M2
        // This is the server side of the SRP specification
        private Error Calculations(string Astr, BigInteger v)
        {
            BigInteger A = new BigInteger(Astr, 16);

            // u = H(A,B)
            BigInteger u = new BigInteger(Utils.Hash(Astr + this.Bstr));
            if (u == 0)
                return new Error(ErrorCode.AUTH_INVALID_PARAM);

            //S = (Av^u) ^ b
            BigInteger Avu = A * (v.modPow(u, N));
            this.S = Avu.modPow(b, N);

            // Calculate the auth hash we will expect from the client (M) and the one we will send back in the next step (M2)
            // M = H(A, B, S)
            //M2 = H(A, M, S)
            string Mstr = A.ToString(16) + this.B.ToString(16) + this.S.ToString(16);
            this.M = KeePassLib.Utility.MemUtil.ByteArrayToHexString(Utils.Hash(Mstr));
            this.M2 = KeePassLib.Utility.MemUtil.ByteArrayToHexString(Utils.Hash(A.ToString(16) + this.M.ToLower() + this.S.ToString(16)));
            return new Error(ErrorCode.SUCCESS);
        }

        // Receive M from the client and verify it
        internal void Authenticate(string Mclient)
        {
            if (Mclient.ToLower() == M.ToLower())
            {
                Authenticated = true;
            }
        }


    }
}
