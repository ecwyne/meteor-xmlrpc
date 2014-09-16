(function() {
  var url          = Npm.require('url'),
      Serializer   = Npm.require('xmlrpc/lib/serializer.js'),
      Deserializer = Npm.require('xmlrpc/lib/deserializer.js'),
      Cookies      = Npm.require('xmlrpc/lib/cookies.js'),
      Resumer      = Npm.require('resumer');
  /**
   * Creates a Client object for making XML-RPC method calls.
   *
   * @constructor
   * @param {String} url
   * @param {Object} options        - Server options to make the HTTP request to.
   * @return {Client}
   */
  function Client(url, options) {
    options = options || {};

    options.url = url;

    // Set the HTTP request headers
    var headers = {
      'User-Agent'     : 'NodeJS XML-RPC Client',
      'Content-Type'   : 'text/xml',
      'Accept'         : 'text/xml',
      'Accept-Charset' : 'UTF8',
      'Connection'     : 'Keep-Alive'
    };
    options.headers = options.headers || {};

    for (var attribute in headers) {
      if (options.headers[attribute] === undefined) {
        options.headers[attribute] = headers[attribute];
      }
    }

    options.method = 'POST';
    this.options = options;

    this.headersProcessors = {
      processors: [],
      composeRequest: function(headers) {
        this.processors.forEach(function(p) {
          p.composeRequest(headers);
        });
      },
      parseResponse: function(headers) {
        this.processors.forEach(function(p) {
          p.parseResponse(headers);
        });
      }
    };

    if (options.cookies) {
      this.cookies = new Cookies();
      this.headersProcessors.processors.unshift(this.cookies);
    }
  }

  /**
   * Makes an XML-RPC call to the server specified by the constructor's options.
   *
   * @param {String} method     - The method name.
   * @param {Array} params      - Params to send in the call.
   * @param {Function} callback - function(error, value) { ... }
   *   - {Object|null} error    - Any errors when making the call, otherwise null.
   *   - {mixed} value          - The value returned in the method response.
   */
  Client.prototype.methodCall = function methodCall(method, params, callback) {
    var xml       = Serializer.serializeMethodCall(method, params),
        options   = this.options;

    options.headers['Content-Length'] = Buffer.byteLength(xml, 'utf8');
    this.headersProcessors.composeRequest(options.headers);

    requestOptions = {
      content: xml,
      headers: options.headers,
      followRedirects: true
    };

    var me = this;

    Meteor.http.call(options.method, options.url, requestOptions, function(error, response) {
      if (error) {
        callback(error);
        return;
      }

      if (!response.content) {
        callback(new Meteor.Error(400, "Invalid Response"));
        return;
      }

      me.headersProcessors.parseResponse(response.headers);
      var deserializer = new Deserializer(options.responseEncoding);

      // Create stream
      stream = Resumer().queue(response.content).end();
      stream.setEncoding = function() {};

      deserializer.deserializeMethodResponse(stream, callback);
    });
  };

  /**
   * Gets the cookie value by its name. The latest value received from servr with 'Set-Cookie' header is returned
   * Note that method throws an error if cookies were not turned on during client creation (see comments for constructor)
   *
   * @param {String} name name of the cookie to be obtained or changed
   * @return {*} cookie's value
   */
  Client.prototype.getCookie = function getCookie(name) {
    if (!this.cookies) {
      throw 'Cookies support is not turned on for this client instance';
    }
    return this.cookies.get(name);
  };

  /**
   * Sets the cookie value by its name. The cookie will be sent to the server during the next xml-rpc call.
   * The method returns client itself, so it is possible to chain calls like the following:
   *
   * <code>
   *   client.cookie('login', 'alex').cookie('password', '123');
   * </code>
   *
   * Note that method throws an error if cookies were not turned on during client creation (see comments for constructor)
   *
   * @param {String} name name of the cookie to be changed
   * @param {String} value value to be set.
   * @return {*} client object itself
   */
  Client.prototype.setCookie = function setCookie(name, value) {
    if (!this.cookies) {
      throw 'Cookies support is not turned on for this client instance';
    }
    this.cookies.set(name, value);
    return this;
  };

	Meteor.XmlRpcClient = Client;
})();