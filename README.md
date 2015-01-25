IBM IOT integration example
==================

This little proxy will connect to nest and publish the data to a mqtt broker.

I used the IBM IoT Cloud more information are at 
https://internetofthings.ibmcloud.com/#/ and

https://developers.google.com/+/quickstart/android

you will need to update configuration.properties file

org=Your IBM IoT Org 
type=mvk-laptoplan
id=Your Mack 00-21-CC-C8-6F-1AA
auth-method=token
auth-token=Your Token 
nestusername=nest email address
nestpassword=NestPassword


run npm install
and node devicetoiot.js

Please node this is just a playground and not for production or anything just test purposes.

mvk@ca.ibm.com