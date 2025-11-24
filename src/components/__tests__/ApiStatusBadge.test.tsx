import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ApiStatusBadge from '../ApiStatusBadge';

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: { status: 'active' }, error: null }),
        })),
      })),
    })),
  }),
}));

describe('ApiStatusBadge', () => {
  const mockApiId = 'test-api-id';

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should display active status', () => {
    render(<ApiStatusBadge apiId={mockApiId} initialStatus="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should display generating status with text', () => {
    render(<ApiStatusBadge apiId={mockApiId} initialStatus="generating" />);
    expect(screen.getByText(/Generating/i)).toBeInTheDocument();
  });

  it('should display failed status', () => {
    render(<ApiStatusBadge apiId={mockApiId} initialStatus="failed" />);
    expect(screen.getByText(/Failed/i)).toBeInTheDocument();
  });

  it('should display pending status', () => {
    render(<ApiStatusBadge apiId={mockApiId} initialStatus="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should have correct styling for active status', () => {
    render(<ApiStatusBadge apiId={mockApiId} initialStatus="active" />);
    const badge = screen.getByText('Active').parentElement;
    expect(badge).toHaveClass('bg-emerald-500/10');
  });

  it('should have correct styling for failed status', () => {
    render(<ApiStatusBadge apiId={mockApiId} initialStatus="failed" />);
    const badge = screen.getByText(/Failed/i).parentElement;
    expect(badge).toHaveClass('bg-red-500/10');
  });
});
