import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CopyButton from '../CopyButton';

describe('CopyButton', () => {
  const mockText = 'Test copy text';

  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn(() => Promise.resolve()),
      },
      writable: true,
      configurable: true,
    });
  });

  it('should render the copy button', () => {
    render(<CopyButton textToCopy={mockText} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should show copy icon initially', () => {
    render(<CopyButton textToCopy={mockText} />);
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
  });

  it('should copy text to clipboard when clicked', async () => {
    render(<CopyButton textToCopy={mockText} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  it('should show check icon after successful copy', async () => {
    render(<CopyButton textToCopy={mockText} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });
  });

  it('should handle copy failure gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    navigator.clipboard.writeText = jest.fn(() => Promise.reject(new Error('Copy failed')));
    
    render(<CopyButton textToCopy={mockText} />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    consoleErrorSpy.mockRestore();
  });
});
