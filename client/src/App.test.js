import { render, screen } from '@testing-library/react';
import App from './App';

//@ts-ignore
window.setImmediate = window.setTimeout

test('renders index', () => {
  render(<App />);
  const element = screen.getByText(/Room/i);
  expect(element).toBeInTheDocument();
});
