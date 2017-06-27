import { test } from 'qunit';
import Ember from 'ember';
import { history } from '../../locations/none-with-history-tracking';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

const { Controller } = Ember;

moduleForAcceptance('Acceptance | Router Service', {
  beforeEach() {
    this.owner = this.application.__deprecatedInstance__;

    this.routerService = this.owner.lookup('service:router');
    this.state = history;
    // this sucks, but ember-testing package forcefully reopen's the router
    // and sets `location: 'none'`
    this.routerService._router.location = 'none-with-history-tracking';
  },

  afterEach() {
    history.length = 0;
  }
});

test('transitionTo works', function(assert) {
  assert.expect(1);

  return visit('/')
    .then(() => {
      return this.routerService.transitionTo('parent.child');
    })
    .then(() => {
      return this.routerService.transitionTo('parent.sister');
    })
    .then(() => {
      return this.routerService.transitionTo('parent.brother');
    })
    .then(() => {
      return this.routerService.transitionTo('parent.sister');
    })
    .then(() => {
      assert.deepEqual(this.state, ['/', '/child', '/sister', '/brother', '/sister']);
    });
});

test('replaceWith works', function(assert) {
  assert.expect(1);

  return visit('/')
    .then(() => {
      return this.routerService.transitionTo('parent.child');
    })
    .then(() => {
      return this.routerService.transitionTo('parent.sister');
    })
    .then(() => {
      return this.routerService.transitionTo('parent.brother');
    })
    .then(() => {
      return this.routerService.transitionTo('parent.sister');
    })
    .then(() => {
      assert.deepEqual(this.state, ['/', '/child', '/sister', '/brother', '/sister']);
    });
});

test('using transitionTo/replaceWith with query params does not remove default values', function(assert) {
  this.owner.register('controller:parent/child', Controller.extend({
    queryParams: ['sort'],
    sort: 'ASC'
  }));

  return visit('/')
    .then(() => {
      return this.routerService.transitionTo('parent.child', {
        queryParams: {
          sort: 'ASC'
        }
      });
    })
    .then(() => {
      assert.equal(currentURL(), '/child?sort=ASC');
      return this.routerService.transitionTo('parent.sister');
    })
    .then(() => {
      assert.equal(currentURL(), '/sister');
      return this.routerService.replaceWith('parent.child', {
        queryParams: {
          sort: 'DESC'
        }
      });
    })
    .then(() => {
      assert.equal(currentURL(), '/child?sort=DESC');
      assert.deepEqual(this.state, ['/', '/child?sort=ASC', '/child?sort=DESC']);
    });
});

test('currentURL, currentRouteName, and isActive work', function(assert) {
  assert.expect(24);

  let { routerService } = this;

  this.owner.register('controller:parent/child', Controller.extend({
    queryParams: ['sort'],
    sort: 'ASC'
  }));

  function confirm(...args) {
    let expectedRouteName = args.shift();
    let dynamicArgs = args;
    let expectedURL = args.pop();

    andThen(() => {
      let actualURL = currentURL();
      let actualRouteName = currentRouteName();

      let isActive = routerService.isActive(expectedRouteName, ...dynamicArgs);

      assert.pushResult({
        result: isActive,
        expected: true,
        actual: isActive,
        message: `isActive should be true for ${expectedURL}`
      });

      assert.pushResult({
        result: actualURL === expectedURL,
        expected: expectedURL,
        actual: actualURL
      });

      assert.pushResult({
        result: actualRouteName=== expectedRouteName,
        expected: expectedRouteName,
        actual: actualRouteName
      });
    });
  }

  visit('/');
  confirm('parent.index', '/');
  visit('/child');
  confirm('parent.child', '/child');
  visit('/sister');
  confirm('parent.sister', '/sister');
  visit('/brother');
  confirm('parent.brother', '/brother');
  visit('/sister');
  confirm('parent.sister', '/sister');
  visit('/dynamic/1');
  confirm('dynamic', 1, '/dynamic/1');
  visit('/dynamic/1');
  confirm('dynamic', 1, '/dynamic/1');
  visit('/child?sort=DESC');
  confirm('parent.child', { queryParams: { sort: 'DESC' }}, '/child?sort=DESC');
});

test('urlFor works', function(assert) {
  visit('/');

  andThen(() => {
    assert.equal(this.routerService.urlFor('parent.child'), '/child');
    assert.equal(this.routerService.urlFor('parent.sister'), '/sister');
    assert.equal(this.routerService.urlFor('parent.brother'), '/brother');
    assert.equal(
      this.routerService.urlFor('parent.brother', {
        queryParams: {
          derp: 'foo'
        }
      }),
      '/brother?derp=foo'
    );
    assert.equal(this.routerService.urlFor('dynamic', 1), '/dynamic/1');
    assert.equal(
      this.routerService.urlFor('dynamic', 1, {
        queryParams: {
          huzzah: 'lol'
        }
      }),
      '/dynamic/1?huzzah=lol'
    );
  });
});
