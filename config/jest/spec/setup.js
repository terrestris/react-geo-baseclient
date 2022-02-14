import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import '@babel/polyfill';
import 'jest-canvas-mock';

require('es6-promise').polyfill();

global.window = {};
global.fetch = jest.fn(() => new Promise(resolve => resolve()));

Enzyme.configure({ adapter: new Adapter() });
