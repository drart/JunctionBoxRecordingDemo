// Use Chrome's system.network API to display local IP to the user
chrome.system.network.getNetworkInterfaces( function(interfaces){
  
  for ( var i = 0 ; i < interfaces.length; i++){
    
    if ( interfaces[i].prefixLength === 24){ // only print the IP4 address
      document.getElementById("list").innerText = interfaces[i].address;
    }
    //console.log(interfaces[i]);  
  }
});


var synth = flock.synth({
  synthDef: {
      id: "singer",
      ugen: "flock.ugen.sinOsc",
      mul: 0,
      freq: {
        ugen: "flock.ugen.sinOsc",
        freq: 10, 
        add: 500, 
        mul: 0
      }
  }
});

var fadeout = {
  ugen: "flock.ugen.line",
  start: 1, 
  end: 0, 
  duration: 0.1
}

var fadein = {
  ugen: "flock.ugen.line",
  start: 0, 
  end: 1, 
  duration: 0.1
}

var udpPort = new osc.UDPPort({
    localAddress: "127.0.0.1",
    localPort: 57110
});

udpPort.on("open", function () {
    document.getElementById("message").innerText = "Listening for UDP on port " + udpPort.options.localPort;
});

udpPort.on("message", function(message){
  document.getElementById("message").innerText = message.address + "   " + message.args;
  
  if(message.address === "/activate"){
    if (message.args[0] === 1)
      synth.set("singer.mul", fadein );
    else
     synth.set("singer.mul", fadeout );
  }
  
  
  if(message.address === "/contact/xy"){
    synth.set("singer.freq.add", message.args[1]*500 );
    synth.set("singer.freq.mul", message.args[2]*30 );
  }
  
  
});

udpPort.on("error", function (err) {
    throw new Error(err);
});

udpPort.open();
synth.play();
