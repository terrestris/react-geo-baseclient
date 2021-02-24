import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import '@babel/polyfill';
import 'whatwg-fetch';
import 'jest-canvas-mock';

require('es6-promise').polyfill();

global.window = {};

Enzyme.configure({ adapter: new Adapter() });
