import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import '@babel/polyfill';
import 'jest-canvas-mock';

require('es6-promise').polyfill();

global.window = {};
global.fetch = require('jest-fetch-mock');

Enzyme.configure({ adapter: new Adapter() });
