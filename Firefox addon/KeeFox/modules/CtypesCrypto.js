/*
KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass-plugin)
Copyright 2008-2013 Chris Tomlinson <keefox@christomlinson.name>

CtypesCrypto.js provides access to NSS crypto functions using ctypes
so that AES crypto operations can be performed quickly

It is a cut-down version of WeaveCrypto, previously released under MPL terms

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

var EXPORTED_SYMBOLS = ["CtypesCrypto"];

Cu.import("resource://gre/modules/ctypes.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://kfmod/KFLogger.js");

const AES_256_CBC = 188; // http://mxr.mozilla.org/mozilla-central/source/security/nss/lib/util/secoidt.h#300

var CtypesCrypto = {

  nss : null,
  nss_t : null,

  log : function (message) {
    KFLog.debug(message);
  },

  shutdown : function WC_shutdown()
  {
    this.log("closing nsslib");
    this.nsslib.close();
  },

  fullPathToLib: null,

  init : function WC_init() {
      // Full path to NSS via js-ctypes
      let path = Services.dirsvc.get("GreD", Ci.nsILocalFile);
      // Firefox 34 added GreBinD key
      if (Services.dirsvc.has("GreBinD"))
          path = Services.dirsvc.get("GreBinD", Ci.nsILocalFile);

      let libName = ctypes.libraryName("nss3");
      path.append(libName);
      let fullPath = path.path;

    try {
          this.initNSS(libName);
        }
        // if this fails we need to provide the full path
        catch (ex) {
          this.initNSS(fullPath);
        }
    },

  initNSS : function WC_initNSS(aNSSPath) {
    // Open the NSS library.
    this.fullPathToLib = aNSSPath;
    var nsslib = ctypes.open(this.fullPathToLib);

    this.nsslib = nsslib;
    this.log("Initializing NSS types and function declarations...");

    this.nss = {};
    this.nss_t = {};

    // nsprpub/pr/include/prtypes.h#435
    // typedef PRIntn PRBool; --> int
    this.nss_t.PRBool = ctypes.int;
    // security/nss/lib/util/seccomon.h#91
    // typedef enum
    this.nss_t.SECStatus = ctypes.int;
    // security/nss/lib/softoken/secmodt.h#59
    // typedef struct PK11SlotInfoStr PK11SlotInfo; (defined in secmodti.h)
    this.nss_t.PK11SlotInfo = ctypes.void_t;
    // security/nss/lib/util/pkcs11t.h
    this.nss_t.CK_MECHANISM_TYPE = ctypes.unsigned_long;
    this.nss_t.CK_ATTRIBUTE_TYPE = ctypes.unsigned_long;
    this.nss_t.CK_KEY_TYPE = ctypes.unsigned_long;
    this.nss_t.CK_OBJECT_HANDLE = ctypes.unsigned_long;
    // security/nss/lib/softoken/secmodt.h#359
    // typedef enum PK11Origin
    this.nss_t.PK11Origin = ctypes.int;
    // PK11Origin enum values...
    this.nss.PK11_OriginUnwrap = 4;
    // security/nss/lib/softoken/secmodt.h#61
    // typedef struct PK11SymKeyStr PK11SymKey; (defined in secmodti.h)
    this.nss_t.PK11SymKey = ctypes.void_t;
    // security/nss/lib/util/secoidt.h#454
    // typedef enum
    this.nss_t.SECOidTag = ctypes.int;
    // security/nss/lib/util/seccomon.h#64
    // typedef enum
    this.nss_t.SECItemType = ctypes.int;
    // SECItemType enum values...
    this.nss.SIBUFFER = 0;
    // security/nss/lib/softoken/secmodt.h#62 (defined in secmodti.h)
    // typedef struct PK11ContextStr PK11Context;
    this.nss_t.PK11Context = ctypes.void_t;
    // security/nss/lib/util/secoidt.h#454
    // typedef enum
    this.nss_t.SECOidTag = ctypes.int;
    // security/nss/lib/util/seccomon.h#83
    // typedef struct SECItemStr SECItem; --> SECItemStr defined right below it
    this.nss_t.SECItem = ctypes.StructType(
      "SECItem", [{ type: this.nss_t.SECItemType },
                  { data: ctypes.unsigned_char.ptr },
                  { len : ctypes.int }]);

    // security/nss/lib/util/pkcs11t.h
    this.nss.CKA_ENCRYPT = 0x104;
    this.nss.CKA_DECRYPT = 0x105;

    // security/nss/lib/pk11wrap/pk11pub.h#286
    // SECStatus PK11_GenerateRandom(unsigned char *data,int len);
    this.nss.PK11_GenerateRandom = nsslib.declare("PK11_GenerateRandom",
                                                  ctypes.default_abi, this.nss_t.SECStatus,
                                                  ctypes.unsigned_char.ptr, ctypes.int);
    // security/nss/lib/pk11wrap/pk11pub.h#73
    // PK11SlotInfo *PK11_GetInternalKeySlot(void);
    this.nss.PK11_GetInternalKeySlot = nsslib.declare("PK11_GetInternalKeySlot",
                                                      ctypes.default_abi, this.nss_t.PK11SlotInfo.ptr);
    // security/nss/lib/pk11wrap/pk11pub.h#278
    // CK_MECHANISM_TYPE PK11_AlgtagToMechanism(SECOidTag algTag);
    this.nss.PK11_AlgtagToMechanism = nsslib.declare("PK11_AlgtagToMechanism",
                                                     ctypes.default_abi, this.nss_t.CK_MECHANISM_TYPE,
                                                     this.nss_t.SECOidTag);
    // security/nss/lib/pk11wrap/pk11pub.h#269
    // int PK11_GetBlockSize(CK_MECHANISM_TYPE type,SECItem *params);
    this.nss.PK11_GetBlockSize = nsslib.declare("PK11_GetBlockSize",
                                                ctypes.default_abi, ctypes.int,
                                                this.nss_t.CK_MECHANISM_TYPE, this.nss_t.SECItem.ptr);
    // security/nss/lib/pk11wrap/pk11pub.h#293
    // CK_MECHANISM_TYPE PK11_GetPadMechanism(CK_MECHANISM_TYPE);
    this.nss.PK11_GetPadMechanism = nsslib.declare("PK11_GetPadMechanism",
                                                   ctypes.default_abi, this.nss_t.CK_MECHANISM_TYPE,
                                                   this.nss_t.CK_MECHANISM_TYPE);
    // security/nss/lib/pk11wrap/pk11pub.h#271
    // SECItem *PK11_ParamFromIV(CK_MECHANISM_TYPE type,SECItem *iv);
    this.nss.PK11_ParamFromIV = nsslib.declare("PK11_ParamFromIV",
                                               ctypes.default_abi, this.nss_t.SECItem.ptr,
                                               this.nss_t.CK_MECHANISM_TYPE, this.nss_t.SECItem.ptr);
    // security/nss/lib/pk11wrap/pk11pub.h#301
    // PK11SymKey *PK11_ImportSymKey(PK11SlotInfo *slot, CK_MECHANISM_TYPE type, PK11Origin origin,
    // CK_ATTRIBUTE_TYPE operation, SECItem *key, void *wincx);
    this.nss.PK11_ImportSymKey = nsslib.declare("PK11_ImportSymKey",
                                                ctypes.default_abi, this.nss_t.PK11SymKey.ptr,
                                                this.nss_t.PK11SlotInfo.ptr, this.nss_t.CK_MECHANISM_TYPE, this.nss_t.PK11Origin,
                                                this.nss_t.CK_ATTRIBUTE_TYPE, this.nss_t.SECItem.ptr, ctypes.voidptr_t);
    // security/nss/lib/pk11wrap/pk11pub.h#672
    // PK11Context *PK11_CreateContextBySymKey(CK_MECHANISM_TYPE type, CK_ATTRIBUTE_TYPE operation,
    // PK11SymKey *symKey, SECItem *param);
    this.nss.PK11_CreateContextBySymKey = nsslib.declare("PK11_CreateContextBySymKey",
                                                         ctypes.default_abi, this.nss_t.PK11Context.ptr,
                                                         this.nss_t.CK_MECHANISM_TYPE, this.nss_t.CK_ATTRIBUTE_TYPE,
                                                         this.nss_t.PK11SymKey.ptr, this.nss_t.SECItem.ptr);
    // security/nss/lib/pk11wrap/pk11pub.h#685
    // SECStatus PK11_CipherOp(PK11Context *context, unsigned char *out
    // int *outlen, int maxout, unsigned char *in, int inlen);
    this.nss.PK11_CipherOp = nsslib.declare("PK11_CipherOp",
                                            ctypes.default_abi, this.nss_t.SECStatus,
                                            this.nss_t.PK11Context.ptr, ctypes.unsigned_char.ptr,
                                            ctypes.int.ptr, ctypes.int, ctypes.uint8_t.ptr, ctypes.int);
    // security/nss/lib/pk11wrap/pk11pub.h#688
    // SECStatus PK11_DigestFinal(PK11Context *context, unsigned char *data,
    // unsigned int *outLen, unsigned int length);
    this.nss.PK11_DigestFinal = nsslib.declare("PK11_DigestFinal",
                                               ctypes.default_abi, this.nss_t.SECStatus,
                                               this.nss_t.PK11Context.ptr, ctypes.unsigned_char.ptr,
                                               ctypes.unsigned_int.ptr, ctypes.unsigned_int);
    // security/nss/lib/pk11wrap/pk11pub.h#675
    // void PK11_DestroyContext(PK11Context *context, PRBool freeit);
    this.nss.PK11_DestroyContext = nsslib.declare("PK11_DestroyContext",
                                                  ctypes.default_abi, ctypes.void_t,
                                                  this.nss_t.PK11Context.ptr, this.nss_t.PRBool);
    // security/nss/lib/pk11wrap/pk11pub.h#299
    // void PK11_FreeSymKey(PK11SymKey *key);
    this.nss.PK11_FreeSymKey = nsslib.declare("PK11_FreeSymKey",
                                              ctypes.default_abi, ctypes.void_t,
                                              this.nss_t.PK11SymKey.ptr);
    // security/nss/lib/pk11wrap/pk11pub.h#70
    // void PK11_FreeSlot(PK11SlotInfo *slot);
    this.nss.PK11_FreeSlot = nsslib.declare("PK11_FreeSlot",
                                            ctypes.default_abi, ctypes.void_t,
                                            this.nss_t.PK11SlotInfo.ptr);
    // security/nss/lib/util/secitem.h#114
    // extern void SECITEM_FreeItem(SECItem *zap, PRBool freeit);
    this.nss.SECITEM_FreeItem = nsslib.declare("SECITEM_FreeItem",
                                               ctypes.default_abi, ctypes.void_t,
                                               this.nss_t.SECItem.ptr, this.nss_t.PRBool);
  },


  algorithm : AES_256_CBC,

  keypairBits : 2048,

// We don't actually do encryption using ctypes yet
//
//  encrypt : function(clearTextUCS2, symmetricKey, iv) {
//    this.log("encrypt() called");

//    // js-ctypes autoconverts to a UTF8 buffer, but also includes a null
//    // at the end which we don't want. Cast to make the length 1 byte shorter.
//    let inputBuffer = new ctypes.ArrayType(ctypes.unsigned_char)(clearTextUCS2);
//    inputBuffer = ctypes.cast(inputBuffer, ctypes.unsigned_char.array(inputBuffer.length - 1));

//    // When using CBC padding, the output size is the input size rounded
//    // up to the nearest block. If the input size is exactly on a block
//    // boundary, the output is 1 extra block long.
//    let mech = this.nss.PK11_AlgtagToMechanism(this.algorithm);
//    let blockSize = this.nss.PK11_GetBlockSize(mech, null);
//    let outputBufferSize = inputBuffer.length + blockSize;
//    let outputBuffer = new ctypes.ArrayType(ctypes.unsigned_char, outputBufferSize)();

//    outputBuffer = this._commonCrypt(inputBuffer, outputBuffer, symmetricKey, iv, this.nss.CKA_ENCRYPT);

//    return this.encodeBase64(outputBuffer.address(), outputBuffer.length);
//  },

  decrypt : function(byteArrayCipher, symmetricKey, iv) {
    this.log("decrypt() called: " + (new Date()).getTime());

    let buff = new Uint8Array(byteArrayCipher.byteLength);
    buff.set(byteArrayCipher, 0);
    let input = ctypes.uint8_t.ptr(buff);

    let outputBuffer = new ctypes.ArrayType(ctypes.unsigned_char, byteArrayCipher.byteLength)();
    outputBuffer = this._commonCrypt(input, outputBuffer, symmetricKey, iv, this.nss.CKA_DECRYPT, byteArrayCipher.byteLength);
    return outputBuffer.readString();
  },


  _commonCrypt : function (input, output, symmetricKey, iv, operation, inputLength) {
    this.log("_commonCrypt() called");

    // Get rid of the base64 encoding and convert to SECItems.
    let keyItem = this.makeSECItem(symmetricKey, true);
    let ivItem = this.makeSECItem(iv, true);

    // Determine which (padded) PKCS#11 mechanism to use.
    // EG: AES_128_CBC --> CKM_AES_CBC --> CKM_AES_CBC_PAD
    let mechanism = this.nss.PK11_AlgtagToMechanism(this.algorithm);
    mechanism = this.nss.PK11_GetPadMechanism(mechanism);

    if (mechanism == this.nss.CKM_INVALID_MECHANISM)
      throw new Error("invalid algorithm (can't pad)");

    let ctx, symKey, slot, ivParam;
    try {
      ivParam = this.nss.PK11_ParamFromIV(mechanism, ivItem.address());
      if (ivParam.isNull())
        throw new Error("can't convert IV to param");

      slot = this.nss.PK11_GetInternalKeySlot();
      if (slot.isNull())
        throw new Error("can't get internal key slot");

      symKey = this.nss.PK11_ImportSymKey(slot, mechanism, this.nss.PK11_OriginUnwrap, operation, keyItem.address(), null);
      if (symKey.isNull())
        throw new Error("symkey import failed");

      ctx = this.nss.PK11_CreateContextBySymKey(mechanism, operation, symKey, ivParam);
      if (ctx.isNull())
        throw new Error("couldn't create context for symkey");

      let maxOutputSize = output.length;
      let tmpOutputSize = new ctypes.int(); // Note 1: NSS uses a signed int here...

      if (this.nss.PK11_CipherOp(ctx, output, tmpOutputSize.address(), maxOutputSize, input, inputLength))
        throw new Error("cipher operation failed");

      let actualOutputSize = tmpOutputSize.value;
      let finalOutput = output.addressOfElement(actualOutputSize);
      maxOutputSize -= actualOutputSize;

      // PK11_DigestFinal sure sounds like the last step for *hashing*, but it
      // just seems to be an odd name -- NSS uses this to finish the current
      // cipher operation. You'd think it would be called PK11_CipherOpFinal...
      let tmpOutputSize2 = new ctypes.unsigned_int(); // Note 2: ...but an unsigned here!
      if (this.nss.PK11_DigestFinal(ctx, finalOutput, tmpOutputSize2.address(), maxOutputSize))
        throw new Error("cipher finalize failed");

      actualOutputSize += tmpOutputSize2.value;
      let newOutput = ctypes.cast(output, ctypes.unsigned_char.array(actualOutputSize));
      return newOutput;
    } catch (e) {
      this.log("_commonCrypt: failed: " + e);
      throw e;
    } finally {
      if (ctx && !ctx.isNull())
        this.nss.PK11_DestroyContext(ctx, true);
      if (symKey && !symKey.isNull())
        this.nss.PK11_FreeSymKey(symKey);
      if (slot && !slot.isNull())
        this.nss.PK11_FreeSlot(slot);
      if (ivParam && !ivParam.isNull())
        this.nss.SECITEM_FreeItem(ivParam, true);
    }
  },


  //
  // Utility functions
  //

  generateRandomBytes : function(byteCount) {
    this.log("generateRandomBytes() called");

    // Temporary buffer to hold the generated data.
    let scratch = new ctypes.ArrayType(ctypes.unsigned_char, byteCount)();
    if (this.nss.PK11_GenerateRandom(scratch, byteCount))
      throw new Error("PK11_GenrateRandom failed");

    return this.encodeBase64(scratch.address(), scratch.length);
  },

  /**
     * Compress a JS string into a C uint8 array. count is the number of
     * elements in the destination array. If the array is smaller than the
     * string, the string is effectively truncated. If the string is smaller
     * than the array, the array is 0-padded.
     */
    byteCompressInts : function byteCompressInts (jsString, intArray, count) {
        let len = jsString.length;
        let end = Math.min(len, count);

        for (let i = 0; i < end; i++)
            intArray[i] = jsString.charCodeAt(i) % 256; // convert to bytes

        // Must zero-pad.
        for (let i = len; i < count; i++)
            intArray[i] = 0;
    },

  //TODO: Can probably update code calling this to use above int version...
  // Compress a JS string (2-byte chars) into a normal C string (1-byte chars)
  // EG, for "ABC", 0x0041, 0x0042, 0x0043 --> 0x41, 0x42, 0x43
  byteCompress : function (jsString, charArray) {
    let intArray = ctypes.cast(charArray, ctypes.uint8_t.array(charArray.length));
    for (let i = 0; i < jsString.length; i++) {
      intArray[i] = jsString.charCodeAt(i) % 256; // convert to bytes
    }

  },

  // Expand a normal C string (1-byte chars) into a JS string (2-byte chars)
  // EG, for "ABC", 0x41, 0x42, 0x43 --> 0x0041, 0x0042, 0x0043
  byteExpand : function (charArray) {
    let expanded = "";
    let len = charArray.length;
    let intData = ctypes.cast(charArray, ctypes.uint8_t.array(len));
    for (let i = 0; i < len; i++)
      expanded += String.fromCharCode(intData[i]);

    return expanded;
  },

  encodeBase64 : function (data, len) {
    // Byte-expand the buffer, so we can treat it as a UCS-2 string
    // consisting of u0000 - u00FF.
    let expanded = "";
    let intData = ctypes.cast(data, ctypes.uint8_t.array(len).ptr).contents;
    for (let i = 0; i < len; i++)
      expanded += String.fromCharCode(intData[i]);

    return btoa(expanded);
  },


  makeSECItem : function(input, isEncoded) {
    if (isEncoded)
      input = atob(input);

    let outputData = new ctypes.ArrayType(ctypes.unsigned_char, input.length)();
    this.byteCompress(input, outputData);

    return new this.nss_t.SECItem(this.nss.SIBUFFER, outputData, outputData.length);
  }
};
