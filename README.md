# home-water-iot
CSC453 water distribution management project

This project requires Node 6. Before getting started, remember to `npm install`. This project makes the assumption that the bonescript libarary is installed globally on your device.

This project uses the following commands:

* `npm run configure` - set up a new device configuration
* `npm run connect`   - connect this device to your local network
* `npm run start`     - starts the water management system on this device
* `npm test`          - run system tests

## Demo code
This project uses the code in the /samples directory for demo. The server program is _final_server_mod.js_ and the client program is _final_client_mod.js_. Run them as follows:

To set up the ad-hoc network (_IP_ is the IP Address of that device):

`sudo ./setup_ad_hoc [IP]`

To run the server program:

`sudo node final_server_mod.js`

To run the client program (_X_ is the name of the faucet):

`sudo node final_client_mod.js [X]` 

## Description of Important Files Used in Development (/samples)
* flowTest.js - initial test code for testing the flow sensor
* FlowTestv2.0.js - modified test code for testing the flow sensor
* ultraSonic.js - test code (from Beaglebone.org) for testing the ultrasonic sensor
* Test_client.js - initial client code testing
* Test_server.js - initial server code testing
* final_client.js - demo program for client; takes command line argument to specify the name of the faucet client
* final_server.js - demo program for server
* final_client_mod.js - modified client program to support message buffer for TCP sockets
* final_server_mod.js - modified server program to support message buffer for TCP sockets
* setup_ad_hoc - bash script used to automatically configure ad-hoc network given IP Address as command line argument
