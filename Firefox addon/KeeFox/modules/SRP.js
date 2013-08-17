/*
KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass-plugin)
Copyright 2008-2013 Chris Tomlinson <keefox@christomlinson.name>

SRP functions. Currently includes only SRPc, a SRP client implementation.

Inspiration and some code comes from
http://code.google.com/p/srp-js/ used under a BSD license.

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
"use strict";

let Ci = Components.interfaces;
let Cu = Components.utils;

var EXPORTED_SYMBOLS = ["SRPc"];

Cu.import("resource://kfmod/utils.js");
Cu.import("resource://kfmod/biginteger.js");
Cu.import("resource://kfmod/KFLogger.js");

function SRPc()
{
    // Variables that will be used in the SRP protocol
    var Nstr = "d4c7f8a2b32c11b8fba9581ec4ba4f1b04215642ef7355e37c0fc0443ef756ea2c6b8eeb755a1c723027663caa265ef785b8ff6a9b35227a52d86633dbdfca43";
    var N = BigInteger.parse(Nstr, 16);
    var g = new BigInteger("2");
    var k = BigInteger.parse("b7867f1299da8cc24ab93e08986ebc4d6a478ad0", 16);
    var a = utils.BigIntFromRandom(32);
    var A = g.modPow(a, N);
    while(A.remainder(N) == 0)
    {
        a = utils.BigIntFromRandom(32);
        A = g.modPow(a, N);
    }
    this.Astr = A.toString(16);
    this.S = null;
    this.K = null;
    this.M = null;
    this.M2 = null;
    var that = this;
    var authenticated = false;
    var I = null;
    this.p = null;
    var xhr = null;

	this.setup = function(username)
	{
    	this.I = username;
	}
	
    // Calculates the X value and return it as a BigInteger
    this.calcX = function(s)
    {
        return BigInteger.parse(utils.hash(s + utils.hash(I + ":" + p)), 16);
    };

    // Receive login salts from the server, start calculations
    this.receive_salts = function (s, Bstr)
    {
    	this.calculations(s, Bstr, this.p);
    };
    
    // Calculate S, M, and M2
    this.calculations = function(s, ephemeral, pass) // string, string, string
    {    
        //S -> C: s | B
        var B = BigInteger.parse(ephemeral, 16); 
        var Bstr = ephemeral;
        // u = H(A,B)
        var u = BigInteger.parse(utils.hash(this.Astr + Bstr), 16); 
        // x = H(s, p)
        var x = BigInteger.parse(utils.hash(s + pass), 16);
        //var x = new BigInteger(SHA256(s + SHA256(I + ":" + pass)), 16); // x = H(s, H(I:p))
        //S = (B - kg^x) ^ (a + ux)
        var kgx = k.multiply(g.modPow(x, N));  
        var aux = a.add(u.multiply(x)); 
        this.S = B.subtract(kgx).modPow(aux, N);
        
        // Calculate the auth hash we will send to the server (M) and the one we expect back in the next step (M2)
         // M = H(A, B, S)
        var Mstr = A.toString(16) + B.toString(16) + this.S.toString(16);
        this.M = utils.hash(Mstr);
        this.M2 = utils.hash(A.toString(16) + this.M + this.S.toString(16));
        //M2 = H(A, M, S)
    };

    // Receive M2 from the server and verify it
    this.confirm_authentication = function (M2server)
    {
		if(M2server.toLowerCase() == this.M2.toLowerCase())
		{
            this.authenticated = true;
		    this.success();
	    }
		else
		    KFLog.error("Server key does not match");
    };

    this.success = function()
    {
        return;
    };

    // When someone wants to use the session key for encrypting traffic, they can
    // access the key with this function. It's a deferred calculation to reduce impact
    // of DOS attacks (which would generally fail the connection attempt before getting this far)
    this.key = function()
    {
        if(this.K == null)
            if(this.authenticated)
            {
                this.K = utils.hash(this.S.toString(16)).toLowerCase();
                return this.K;
            }
            else
                KFLog.error("User has not been authenticated.");
        else
            return this.K;

    };    
};