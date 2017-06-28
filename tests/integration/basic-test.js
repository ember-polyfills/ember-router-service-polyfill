import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('Integration | Router Service', {
  integration: true,

  beforeEach() {
    Ember.getOwner(this).lookup('router:main').setupRouter();
  }
});

// Replace this with your real tests.
test('it can generate simple urls', function(assert) {
  this.register('helper:url-for', Ember.Helper.extend({
    router: Ember.inject.service(),

    compute(params) {
      return this.get('router').urlFor(...params);
    }
  }));

  this.render(hbs`{{url-for 'parent.child'}}`);

  assert.equal(this.$()[0].textContent, '/child');
});
