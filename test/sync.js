(function() {

  var Environment = this.Environment = function(){};

  _.extend(Environment.prototype, {

    ajax: Backbone.ajax,

    sync: Backbone.sync,

    setup: function() {
      var env = this;

      // Capture ajax settings for comparison.
      Backbone.ajax = function(settings) {
        env.ajaxSettings = settings;
      };

      // Capture the arguments to Backbone.sync for comparison.
      Backbone.sync = function(method, model, options) {
        env.syncArgs = {
          method: method,
          model: model,
          options: options
        };
        env.sync.apply(this, arguments);
      };
    },

    teardown: function() {
      this.syncArgs = null;
      this.ajaxSettings = null;
      Backbone.sync = this.sync;
      Backbone.ajax = this.ajax;
    }

  });

  var Library = Backbone.Model.extend({
    urlRoot: '/library'
  });
  var library;

  var attrs = {
    title  : "The Tempest",
    author : "Bill Shakespeare",
    length : 123
  };

  QUnit.module("Backbone.sync", _.extend(new Environment, {

    setup : function() {
      Environment.prototype.setup.apply(this, arguments);
      library = new Library(attrs);
    },

    teardown: function() {
      Environment.prototype.teardown.apply(this, arguments);
    }

  }));

  test("read", 4, function() {
    library.fetch();
    equal(this.ajaxSettings.url, '/library');
    equal(this.ajaxSettings.type, 'GET');
    equal(this.ajaxSettings.dataType, 'json');
    ok(_.isEmpty(this.ajaxSettings.data));
  });

  test("passing data", 3, function() {
    library.fetch({data: {a: 'a', one: 1}});
    equal(this.ajaxSettings.url, '/library');
    equal(this.ajaxSettings.data.a, 'a');
    equal(this.ajaxSettings.data.one, 1);
  });

  test("update", 7, function() {
    library.save({id: '1-the-tempest', author: 'William Shakespeare'});
    equal(this.ajaxSettings.url, '/library/1-the-tempest');
    equal(this.ajaxSettings.type, 'PUT');
    equal(this.ajaxSettings.dataType, 'json');
    var data = JSON.parse(this.ajaxSettings.data);
    equal(data.id, '1-the-tempest');
    equal(data.title, 'The Tempest');
    equal(data.author, 'William Shakespeare');
    equal(data.length, 123);
  });

  test("read model", 3, function() {
    library.save({id: '2-the-tempest', author: 'Tim Shakespeare'});
    library.fetch();
    equal(this.ajaxSettings.url, '/library/2-the-tempest');
    equal(this.ajaxSettings.type, 'GET');
    ok(_.isEmpty(this.ajaxSettings.data));
  });

  test("destroy", 3, function() {
    library.save({id: '2-the-tempest', author: 'Tim Shakespeare'});
    library.destroy({wait: true});
    equal(this.ajaxSettings.url, '/library/2-the-tempest');
    equal(this.ajaxSettings.type, 'DELETE');
    equal(this.ajaxSettings.data, null);
  });

  test("urlError", 2, function() {
    var model = new Backbone.Model();
    raises(function() {
      model.fetch();
    });
    model.fetch({url: '/one/two'});
    equal(this.ajaxSettings.url, '/one/two');
  });

  test("#1052 - `options` is optional.", 0, function() {
    var model = new Backbone.Model();
    model.url = '/test';
    Backbone.sync('create', model);
  });

  test("Backbone.ajax", 1, function() {
    Backbone.ajax = function(settings){
      strictEqual(settings.url, '/test');
    };
    var model = new Backbone.Model();
    model.url = '/test';
    Backbone.sync('create', model);
  });

  test("Call provided error callback on error.", 1, function() {
    var model = new Backbone.Model;
    model.url = '/test';
    Backbone.sync('read', model, {
      error: function() { ok(true); }
    });
    this.ajaxSettings.error();
  });

})();
