Package.describe({
  summary: "Add XMLRPC functionality to meteor.",
  version: "1.0.1",
  git: "https://github.com/ecwyne/meteor-xmlrpc.git",
  name: 'ecwyne:xmlrpc'
});

Npm.depends({
	'xmlrpc': '1.2.0',
	'resumer': '0.0.0'
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@0.9.2.1');
  api.use('http');
  api.addFiles('rpcclient.js', 'server');
});