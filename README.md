meteor-xmlrpc
=============

XMLRPC functionality for Meteor

For full, original documentation click [here](https://github.com/baalexander/node-xmlrpc)

#Install
```
meteor add ecwyne:xmlrpc
```

#Use
```
var client = new Meteor.XmlRpcClient('https://{url_here}');
var options = ['api_key', 'other_options'];
var cb = function callback(){}
client.methodCall('Method_Name', options, cb);
```
