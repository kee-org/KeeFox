
var JSON=function(){var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapeable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},s={'boolean':function(x){return String(x);},number:function(x){return isFinite(x)?String(x):'null';},string:function(x){return escapeable.test(x)?'"'+x.replace(escapeable,function(a){var c=meta[a];if(typeof c==='string'){return c;}
return'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+x+'"';},object:function(x){function p(n){return n<10?'0'+n:n;}
if(x){var a=[],b,f,i,l,v;if(x instanceof Array){a[0]='[';l=x.length;for(i=0;i<l;i+=1){v=x[i];f=s[typeof v];if(f){v=f(v);if(typeof v==='string'){if(b){a[a.length]=',';}
a[a.length]=v;b=true;}}}
a[a.length]=']';}else if(x instanceof Date){var tz=x.getTimezoneOffset();if(tz!==0){var tzh=Math.floor(Math.abs(tz)/60);var tzm=Math.abs(tz)%60;tz=(tz<0?'+':'-')+p(tzh)+':'+p(tzm);}
else{tz='Z';}
return'"'+
x.getFullYear()+'-'+
p(x.getMonth()+1)+'-'+
p(x.getDate())+'T'+
p(x.getHours())+':'+
p(x.getMinutes())+':'+
p(x.getSeconds())+tz+'"';}else if(x instanceof Object){a[0]='{';for(i in x){if(typeof i==='string'&&Object.prototype.hasOwnProperty.apply(x,[i])){v=x[i];f=s[typeof v];if(f){v=f(v);if(typeof v==='string'){if(b){a[a.length]=',';}
a.push(s.string(i),':',v);b=true;}}}}
a[a.length]='}';}else{return;}
return a.join('');}
return'null';}};return{copyright:'(c)2005 JSON.org',license:'http://www.crockford.com/JSON/license.html',stringify:function(v){var f=s[typeof v];if(f){v=f(v);if(typeof v==='string'){return v;}}
return null;},parse:function(text,reviver){function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}
return reviver.call(holder,key,value);}
if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+
('0000'+a.charCodeAt(0).toString(16)).slice(-4);});}
if(!/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){throw new SyntaxError("parse");}
var result=eval('('+text+')');return typeof reviver==='function'?walk({'':result},''):result;},iparse:function(text){var at=0,ch=' ',result,value;function error(m){var e=new SyntaxError(m);e.at=at-1;e.text=text;throw e;}
function next(){ch=text.charAt(at);at+=1;return ch;}
function white(){while(ch){if(ch<=' '){next();}else if(ch==='/'){switch(next()){case'/':while(next()&&ch!=='\n'&&ch!=='\r'){}
break;case'*':next();for(;;){if(ch){if(ch==='*'){if(next()==='/'){next();break;}}else{next();}}else{error("Unterminated comment");}}
break;default:error("Syntax error");}}else{break;}}}
function string(){var i,s='',t,u;if(ch==='"'){outer:while(next()){if(ch==='"'){next();return s;}else if(ch==='\\'){switch(next()){case'b':s+='\b';break;case'f':s+='\f';break;case'n':s+='\n';break;case'r':s+='\r';break;case't':s+='\t';break;case'u':u=0;for(i=0;i<4;i+=1){t=parseInt(next(),16);if(!isFinite(t)){break outer;}
u=u*16+t;}
s+=String.fromCharCode(u);break;default:s+=ch;}}else{s+=ch;}}}
error("Bad string");}
function array(){var a=[];if(ch==='['){next();white();if(ch===']'){next();return a;}
while(ch){a.push(value());white();if(ch===']'){next();return a;}else if(ch!==','){break;}
next();white();}}
error("Bad array");}
function object(){var k,o={};if(ch==='{'){next();white();if(ch==='}'){next();return o;}
while(ch){k=string();white();if(ch!==':'){break;}
next();o[k]=value();white();if(ch==='}'){next();return o;}else if(ch!==','){break;}
next();white();}}
error("Bad object");}
function number(){var n='',v;if(ch==='-'){n='-';next();}
while(ch>='0'&&ch<='9'){n+=ch;next();}
if(ch==='.'){n+='.';while(next()&&ch>='0'&&ch<='9'){n+=ch;}}
if(ch==='e'||ch==='E'){n+='e';next();if(ch==='-'||ch==='+'){n+=ch;next();}
while(ch>='0'&&ch<='9'){n+=ch;next();}}
v=+n;if(!isFinite(v)){}else{return v;}}
function word(){switch(ch){case't':if(next()==='r'&&next()==='u'&&next()==='e'){next();return true;}
break;case'f':if(next()==='a'&&next()==='l'&&next()==='s'&&next()==='e'){next();return false;}
break;case'n':if(next()==='u'&&next()==='l'&&next()==='l'){next();return null;}
break;}
error("Syntax error");}
value=function(){white();switch(ch){case'{':return object();case'[':return array();case'"':return string();case'-':return number();default:return ch>='0'&&ch<='9'?number():word();}};result=value();white();if(ch){error("Syntax error");}
return result;}};}();