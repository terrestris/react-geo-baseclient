import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import '@babel/polyfill';
import 'jest-canvas-mock';

require('es6-promise').polyfill();

global.window = {};
global.fetch = require('jest-fetch-mock');

Enzyme.configure({ adapter: new Adapter() });
