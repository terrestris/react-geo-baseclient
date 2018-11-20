import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

require('es6-promise').polyfill();
require('isomorphic-fetch');

//setupJest.js
global.fetch = require('jest-fetch-mock');

Enzyme.configure({ adapter: new Adapter() });

window.___PRODUCTION___ = false;
