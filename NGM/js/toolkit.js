// here's a compilation of functions that Jan del Ojo Balaguer created (need to ask him for some copyrighht)
// the different functions came (either as is, or with some modificacions) in different scripts but 
// I am putting the ones that are useful for me, together here:


// functions to deal with arrays and matrices 

function matrix(s,k) {
  if(typeof(s)=="undefined") { s=1;   }
  if(typeof(k)=="undefined") { k=NaN; }
  var s = [].concat(s);
  var t = [].concat(s);
  var n = t.splice(0,1);
  var y = [];
  for(var i=0; i<n; i++){
    if(t.length){
      y[i] = matrix(t,k);
    } else {
      y[i] = k;
    }
  }
  return y;
}

function clone(array) {
  if(array == null || typeof(array) != 'object') { return array; }
  var temp = array.constructor();
  for(var key in array) { temp[key] = clone(array[key]); }
  return temp;
};

function repmat(x,k) {
  x = [].concat(x);
  var y = x;
  var i;
  for(i=1; i<k; i++) {
    y = y.concat(x);
  }
  return y;
}

function zeros(s) { return matrix(s,0); }
function ones(s)  { return matrix(s,1); }

function linspace(x1,x2,n) {
  var v_x = [x1];
  for (var i_x = 1; i_x < n; i_x++) { v_x.push(x1 + i_x*(x2-x1)/(n-1)); }
  return v_x;
}

function colon(x1,x2,s_x) {
  if(s_x==undefined) { s_x = 1; }
  if(x2<x1)          { return []; }
  return linspace(x1, x2, 1+(x2-x1)/s_x);
}

// functions to do some matlab type operations

function vequal(u,v) {
  if (typeof(v)=="number" && typeof(u)=="number") { return u==v; }
  if (typeof(v)=="number") { v = matrix(size(u),v); }
  if (typeof(u)=="number") { u = matrix(size(v),u); }
  return applyMatrix(function(u,v){return u==v;},u,v);
}

function power(u,v) {
  if (typeof(v)=="number" && typeof(u)=="number") { return Math.pow(u,v); }
  if (typeof(v)=="number") { v = matrix(size(u),v); }
  if (typeof(u)=="number") { u = matrix(size(v),u); }
  return applyMatrix(function(u,v){return Math.pow(u,v); },u,v);
}

// ANY ARGUMENTS
function vsum() {
  var s = size(arguments[0]);
  var args = [function(){ var s = 0; for(var i=0;i<arguments.length;i++) { s+= arguments[i]; } return s; }];
  for(var i=0;i<arguments.length;i++) {
    if(typeof(arguments[i])=="number")  { args[i+1] = matrix(s,arguments[i]); }
    else                                { args[i+1] = arguments[i];           }
  }
  return applyMatrix.apply(this,args);
}

function vrest() {
  var s = size(arguments[0]);
  var args = [function(){ var s = arguments[0]; for(var i=1;i<arguments.length;i++) { s-= arguments[i]; } return s; }];
  for(var i=0;i<arguments.length;i++) {
    if(typeof(arguments[i])=="number")  { args[i+1] = matrix(s,arguments[i]); }
    else                                { args[i+1] = arguments[i];           }
  }
  return applyMatrix.apply(this,args);
}

function vprod() {
  var s = size(arguments[0]);
  var args = [function(){ var s = 1; for(var i=0;i<arguments.length;i++) { s*= arguments[i]; } return s; }];
  for(var i=0;i<arguments.length;i++) {
    if(typeof(arguments[i])=="number")  { args[i+1] = matrix(s,arguments[i]); }
    else                                { args[i+1] = arguments[i];           }
  }
  return applyMatrix.apply(this,args);
}

function vdiv() {
  var s = size(arguments[0]);
  var args = [function(){ var s = arguments[0]; for(var i=1;i<arguments.length;i++) { s/= arguments[i]; } return s; }];
  for(var i=0;i<arguments.length;i++) {
    if(typeof(arguments[i])=="number")  { args[i+1] = matrix(s,arguments[i]); }
    else                                { args[i+1] = arguments[i];           }
  }
  return applyMatrix.apply(this,args);
}

function vand(u,v) {
  return num2bin(vprod(bin2num(u),bin2num(v)));
}

function vor(u,v) {
  return num2bin(vsum(bin2num(u),bin2num(v)));
}

function vgreater(u,v) {
  if (typeof(v)=="number" && typeof(u)=="number") { return u>v; }
  if (typeof(v)=="number") { v = matrix(size(u),v); }
  if (typeof(u)=="number") { u = matrix(size(v),u); }
  return applyMatrix(function(u,v){return u>v;},u,v);
}

function vless(u,v) {
  if (typeof(v)=="number" && typeof(u)=="number") { return u>v; }
  if (typeof(v)=="number") { v = matrix(size(u),v); }
  if (typeof(u)=="number") { u = matrix(size(v),u); }
  return applyMatrix(function(u,v){return u<v;},u,v);
}





// functions to deal with different data types

function bin2num(b) {
  if(typeof(b)=="number") {
    return b;
  }
  if(typeof(b)=="boolean") {
    if (b) {
      return 1;
    } else {
      return 0;
    }
  }
  var v = [];
  for (var i=0; i<b.length; i++) {
    v = v.concat(bin2num(b[i]));
  }
  return v;
}

function num2bin(n) {
  if(typeof(n)=="boolean") {
    return n;
  }
  if(typeof(n)=="number") {
    if (n) {
      return true;
    } else {
      return false;
    }
  }
  var v = [];
  for (var i=0; i<n.length; i++) {
    v = v.concat(num2bin(n[i]));
  }
  return v;
}

function sign2bin(s) {
  if (s>0)  { return true;  }
  else      { return false; }
}

function bin2sign(b) {
  if (b)  { return  1; }
  else    { return -1; }
}

function toPrecision(x,n){
  var s = x.toFixed(n);
  return str2num(s);
}

function num2str(n) {
  var s = n.toString()
  return s;
}
function str2num(s) {
  var n = parseFloat(s);
  return n;
}

function dec2hex(n) {
  n = Math.round(n);
  return "0123456789ABCDEF".charAt((n-n%16)/16)+"0123456789ABCDEF".charAt(n%16);
}

function rgb2hex(rgb) {
  rgb = vprod(rgb,255);
  return '#'+dec2hex(rgb[0])+dec2hex(rgb[1])+dec2hex(rgb[2]);
}

function hex2rgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgba2hex (r,g,b,a) {
  var outParts = [
    r.toString(16),
    g.toString(16),
    b.toString(16),
    Math.round(a * 255).toString(16).substring(0, 2)
  ];

  // Pad single-digit output values
  outParts.forEach(function (part, i) {
    if (part.length === 1) {
      outParts[i] = '0' + part;
    }
  })

  return ('#' + outParts.join(''));
}

function vec2str(v) {
  var str = '['+v+']';
  return str;
}

function mat2vec(m) {
  if(typeof(m)=="number") { return(m); }
  var v = [];
  for (var i=0; i<m.length; i++) {
    v = v.concat(m[i]);
  }
  return v;
}



// operators

function floor(v)     { return applyMatrix(Math.floor,v);                }
function ceil(v)      { return applyMatrix(Math.ceil,v);                 }
function round(v)     { return applyMatrix(Math.round,v);                }
function abs(v)       { return applyMatrix(Math.abs,v);                  }
function cos(v)       { return applyMatrix(Math.cos,v);                  }
function acos(v)      { return applyMatrix(Math.acos,v);                 }
function sin(v)       { return applyMatrix(Math.sin,v);                  }
function asin(v)      { return applyMatrix(Math.asin,v);                 }
function tan(v)       { return applyMatrix(Math.tan,v);                  }
function atan(v)      { return applyMatrix(Math.atan,v);                 }
function atan2(v)     { return applyMatrix(Math.atan2,v);                }
function exp(v)       { return applyMatrix(Math.exp,v);                  }
function log(v)       { return applyMatrix(Math.log,v);                  }
function isnan(v)     { return applyMatrix(isNaN,v);                     }
function mod(v,m)     { return applyMatrix(function(v){return v%m;},v);  }
function sign(v)      { return applyMatrix(Math.sign,v);                 }
function gamma(v)     { return applyMatrix(Math.gamma,v);                }
function factorial(v) { return applyMatrix(Math.factorial,v);            }
function sqrt(v)      { return applyMatrix(Math.sqrt,v);                 }
function pow2(v)      { return power(2,v);                               }
function vneg(v)      { return applyMatrix(function(v){return -v;},v);   }
function vinv(v)      { return applyMatrix(function(v){return 1/v;},v);  }

function diff(v) {
  assert(size(v).length==1,'sort: error. not a vector');
  var y = matrix(v.length-1);
  for(var i=0;i<y.length;i++) {y[i]=v[i+1]-v[i];}
  return y;
}

function sort(v) {
  assert(size(v).length==1,'sort: error. not a vector');
  var y = clone(v);
  var sortNumber = function(a,b){ return a-b; };
  return y.sort(sortNumber);
}

function normalize(v) {
  assert(size(v).length==1,'sort: error. not a vector');
  var y = clone(v);
  var m = mean(y);
  var s = std(y);
  y = applyMatrix(function(x){return (x-m)/s;},y);
  return y;
}

function shuffle(v,r) {
  if(typeof(r)=="undefined") { r = randperm(v.length); }
  return index(clone(v),r);
}

function vPrecision(v,n) { return applyMatrix(function(v) {return toPrecision(v,n);}, v); }



// SQUEEZE
function squeeze(v) {
  var squeeze = function(v){
    if(typeof(v)=="number") { return v; }
    if(size(v,0)==1)        { return squeeze(v[0]); }
    for(var i=0; i<v.length; i++) {
      v[i] = squeeze(v[i]);
    }
    return v;
  }
  return squeeze(clone(v));
}

// IS MEMBER
function ismember(e,v) {
  if(typeof(v)=="number") { return(v==e); }
  for(var i=0; i<v.length; i++) {
    if(ismember(e,v[i])) { return true; }
  }
  return false;
}

// UNIQUE
function unique(v) {
  assert(size(v).length==1,'unique: error. not a vector');
  var y = [];
  for(var i=0; i<v.length; i++){
    if(!ismember(v[i],y)) { y.push(v[i]); }
  }
  return sort(y);
}


// MIN
function min(v) {
  assert(size(v).length==1,'min: error. not a vector');
  var m = Infinity;
  for (var i=0; i<v.length; i++) {
    if(!isNaN(v[i]) && !(m<v[i])) { m = v[i]; }
  }
  return m;
}

// MAX
function max(v) {
  assert(size(v).length==1,'max: error. not a vector');
  var m = -Infinity;
  for (var i=0; i<v.length; i++) {
    if(!isNaN(v[i]) && m<v[i]) { m = v[i]; }
  }
  return m;
}

// SUM
function sum(v) {
  assert(size(v).length==1,'sum: error. not a vector');
  assert(v.length>0,       'sum: error. not a vector');
  var s = 0;
  for (var i=0; i<v.length; i++) {
    if (!isNaN(v[i])){
      if(typeof(v[i])=="boolean" && v[i]) { s += 1;    }
      else                                { s += v[i]; }
    }
  }
  return s;
}

// PROD
function prod(v) {
  assert(size(v).length==1,'prod: error. not a vector');
  var s = 1;
  for (var i=0; i<v.length; i++) {
    if (!isNaN(v[i])){ s *= v[i]; }
  }
  return s;
}

// MEAN
function mean(v) {
  assert(size(v).length==1,'mean: error. not a vector');
  var s = sum(v);
  var l = v.length - sum(isnan(v));
  var m = s/l;
  return m;
}

// QUANTILES
function quantile(v, p) {
  assert(size(v).length==1,'median: error. not a vector');
  if(p==0) { return min(v); }
  if(p==1) { return max(v); }
  v = sort(v);
  var ret = NaN;
  var prop = Math.floor(p*v.length);
  if(v.length % 2) { ret = v[prop]; }
  else { ret = (v[prop-1] + v[prop]) / 2.0; }
  if (isnan(ret)) {
    if (prop<1)         { ret = min(v); }
    if (prop>=v.length) { ret = max(v); }
  }
  return ret;
}
function median(v) { return quantile(v,0.5); }

// VARIANCE
function variance(v) {
  assert(size(v).length==1,'variance: error. not a vector');
  var s = sum(power(vrest(v,mean(v)),2));
  var l = v.length - sum(isnan(v));
  return s/l;
}

// STANDARD DEVIATION
function std(v) { return Math.sqrt(variance(v)); }

// ALL
function all(v) {
  assert(size(v).length==1,'all: error. not a vector');
  var r = true;
  for (var i=0; i<v.length; i++) {
    r = r && Boolean(v[i]);
  }
  return r;
}

// ANY
function any(v) {
  assert(size(v).length==1,'any: error. not a vector');
  var r = false;
  for (var i=0; i<v.length; i++) {
    r = r || Boolean(v[i]);
  }
  return r;
}


// to get size and dimensions


function isempty(v) {
  if(typeof(v)=="number") {
    return 0;
  }
  if(typeof(v)=="object" || typeof(v)=="string") {
    if(v.length) { return 0; }
    else         { return 1; }
  }
}

function size(v,d) {
  var get_size = function(v) { var s = [1]; if(typeof(v)=="object") { s = [v.length].concat(get_size(v[0])); } return s; };
  var s = get_size(v);
  if(s.length>1) { s.pop(); }
  if(typeof(d)=="undefined") { return s; }
  return s[d];
}

function numel(v) {
  return prod(size(v));
}

function length(v) {
  return max([size(v,0),size(v,1)]);
}



// missing functions


function assert(condition, message) { if (!condition) { throw message || "Assertion failed"; } }
function error(message)             { throw message || "Error"; }
function disp(input)                { console.log(input); }
function fprintf()                  { console.log(sprintf.apply(this,arguments)); }

Math.gamma = function(n) {
  var g = 7;
  var p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if(n < 0.5) { return Math.PI / Math.sin(n * Math.PI) / Math.gamma(1 - n); }
  else {
    n--;
    var x = p[0];
    for(var i = 1; i < g + 2; i++) { x += p[i] / (n + i); }
    var t = n + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, (n + 0.5)) * Math.exp(-t) * x;
  }
}

Math.factorial = function(n) {
  return Math.gamma(n + 1);
}

Math.sign  = function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }


// these are some vector to vector opperations


function vequal(u,v) {
  if (typeof(v)=="number" && typeof(u)=="number") { return u==v; }
  if (typeof(v)=="number") { v = matrix(size(u),v); }
  if (typeof(u)=="number") { u = matrix(size(v),u); }
  return applyMatrix(function(u,v){return u==v;},u,v);
}

function power(u,v) {
  if (typeof(v)=="number" && typeof(u)=="number") { return Math.pow(u,v); }
  if (typeof(v)=="number") { v = matrix(size(u),v); }
  if (typeof(u)=="number") { u = matrix(size(v),u); }
  return applyMatrix(function(u,v){return Math.pow(u,v); },u,v);
}

// ANY ARGUMENTS
function vsum() {
  var s = size(arguments[0]);
  var args = [function(){ var s = 0; for(var i=0;i<arguments.length;i++) { s+= arguments[i]; } return s; }];
  for(var i=0;i<arguments.length;i++) {
    if(typeof(arguments[i])=="number")  { args[i+1] = matrix(s,arguments[i]); }
    else                                { args[i+1] = arguments[i];           }
  }
  return applyMatrix.apply(this,args);
}

function vrest() {
  var s = size(arguments[0]);
  var args = [function(){ var s = arguments[0]; for(var i=1;i<arguments.length;i++) { s-= arguments[i]; } return s; }];
  for(var i=0;i<arguments.length;i++) {
    if(typeof(arguments[i])=="number")  { args[i+1] = matrix(s,arguments[i]); }
    else                                { args[i+1] = arguments[i];           }
  }
  return applyMatrix.apply(this,args);
}

function vprod() {
  var s = size(arguments[0]);
  var args = [function(){ var s = 1; for(var i=0;i<arguments.length;i++) { s*= arguments[i]; } return s; }];
  for(var i=0;i<arguments.length;i++) {
    if(typeof(arguments[i])=="number")  { args[i+1] = matrix(s,arguments[i]); }
    else                                { args[i+1] = arguments[i];           }
  }
  return applyMatrix.apply(this,args);
}

function vdiv() {
  var s = size(arguments[0]);
  var args = [function(){ var s = arguments[0]; for(var i=1;i<arguments.length;i++) { s/= arguments[i]; } return s; }];
  for(var i=0;i<arguments.length;i++) {
    if(typeof(arguments[i])=="number")  { args[i+1] = matrix(s,arguments[i]); }
    else                                { args[i+1] = arguments[i];           }
  }
  return applyMatrix.apply(this,args);
}

function vand(u,v) {
  return num2bin(vprod(bin2num(u),bin2num(v)));
}

function vor(u,v) {
  return num2bin(vsum(bin2num(u),bin2num(v)));
}

function vgreater(u,v) {
  if (typeof(v)=="number" && typeof(u)=="number") { return u>v; }
  if (typeof(v)=="number") { v = matrix(size(u),v); }
  if (typeof(u)=="number") { u = matrix(size(v),u); }
  return applyMatrix(function(u,v){return u>v;},u,v);
}

function vless(u,v) {
  if (typeof(v)=="number" && typeof(u)=="number") { return u>v; }
  if (typeof(v)=="number") { v = matrix(size(u),v); }
  if (typeof(u)=="number") { u = matrix(size(v),u); }
  return applyMatrix(function(u,v){return u<v;},u,v);
}



// random numbers

function randunif(s,xmin,xmax) {
  var v = applyMatrix(function(){return Math.random()*(xmax-xmin)+xmin;},matrix(s));
  if(numel(v)==1) { v=v[0]; }
  return v;
}

function rand(s) { return randunif(s,0,1); }

function randn(s,xmean,xstd) {
  if(typeof(xmean)=='undefined') { xmean=0; }
  if(typeof(xstd )=='undefined') { xstd=1;  }
  var v = applyMatrix(function(){var u,v,a,b,y,y0,y1;u=Math.random();v=Math.random();a=Math.sqrt(-2*Math.log(u));b=2*Math.PI*v;y0=a*Math.cos(b);y1=a*Math.sin(b);return xmean+xstd*y0;},matrix(s));
  if(numel(v)==1) { v=v[0]; }
  return v;
}

function randi(n,s) {
  var v = applyMatrix(function(){return Math.floor(n*Math.random());},matrix(s));
  if(numel(v)==1) { v=v[0]; }
  return v;
}

function randperm(n) {
  var a = colon(0,n-1);
  var b = [];
  while(!isempty(a)){ b = b.concat(a.splice(randi(a.length),1)); }
  return b;
}

function randomElement(v,s) {
  assert(size(v).length==1,'randomElement: error. not a vector');
  if(typeof(s)=='undefined') { return v[randi(v.length)]; }
  var y = matrix(s);
  applyMatrix(function(){return randomElement(v)},y);
  return y;
}

function randgamma(k,t,s) {
  var randgamma_one = function() {
    var k_floor = floor(k);
    var k_delta = k - k_floor;
    var v0 = (Math.E / (Math.E + k_delta));
    var epsilon = 0;
    var eta     = power(epsilon,k_delta-1) * power(Math.E,-epsilon) + 1;
    while (eta > power(epsilon,k_delta-1) * power(Math.E,-epsilon)) {
      if (rand() <= v0) { epsilon = power(rand(),1/k_delta);  eta = rand()*power(epsilon,k_delta-1);  }
      else              { epsilon = 1-log(rand());            eta     = rand() * exp(-epsilon);       }
    }
    var elnu = log(rand(k_floor));
    if (k_floor>1) { elnu = sum(elnu); }
    var gamma = t*(epsilon - elnu);
    return gamma;
  }
  var v = applyMatrix(randgamma_one,matrix(s));
  if(numel(v)==1) { v=v[0]; }
  return v;
}


function findv(v,s) {
var indx = [];
for (i = 0; i<v.length; i++)  {
  if (isequal(v[i],s)) {
      indx = i;
      break
  }
}
return indx
}


function isequal(v,w) {
  if (typeof(v)=="number" && typeof(w)=="number") {
    return (v==w);
  }
  if(v.length!=w.length) { return 0; }
  for(var i=0; i<v.length; i++) {
    if(!isequal(v[i],w[i])) { return 0; } 
  }
  return 1;
}

function dotprod(u,v) {
  return sum(vprod(u,v));
}

function distance(u,v) {
  var r = vrest(u,v);
  return Math.sqrt(dotprod(r,r));
}



function index(v,ii) {
  if(isempty(ii)) { return v; }
  // number
  if(typeof(ii)=="number") { return v[ii]; }
  // array
  var y = [];
  var j = 0;
  for(var i=0; i<ii.length; i++) {
    if(typeof(ii[i])=="number") {
      y[j] = v[ii[i]];
      j++;
    } else if (typeof(ii[i])=="boolean") {
      if(ii[i]) {
        y[j] = v[i];
        j++;
      }
    } else {
      error("index not recognised");
    }
  }
  return y;
}

function applyMatrix() {
  // variables
  var func = arguments[0];
  var mats = [arguments[1]];
  for(var i=1; i<arguments.length-1; i++) { mats[i] = arguments[i+1]; }
  // assert
  assert(typeof(func)=="function",'applyMatrix: error. not a function');
  var s = size(mats[0]);
  for(var i=1; i<mats.length; i++) { assert(isequal(s,size(mats[i])),'applyMatrix: error. size not consistent'); }
  // number
  var m = matrix();
  if (typeof(mats[0])=="number" || typeof(mats[0])=="boolean"){
    return func.apply(this,mats);
  }
  // vector
  for(var i=0; i<s[0]; i++){
    var subarguments = [func];
    for(var j=0; j<mats.length; j++){
      subarguments[j+1]= mats[j][i];
    }
    m[i] = applyMatrix.apply(this,subarguments);
  }
  return m;
}

