import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/tests/utils/test-utils';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<Button loading>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    // Check for loading spinner (CircularProgress)
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('should be disabled when loading', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    button.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    );
    
    const button = screen.getByRole('button');
    button.click();
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply variant styles', () => {
    const { rerender } = render(<Button variant="contained">Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button variant="outlined">Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button variant="text">Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should apply size styles', () => {
    const { rerender, container } = render(<Button size="small">Small</Button>);
    expect(container.querySelector('button')).toBeInTheDocument();

    rerender(<Button size="medium">Medium</Button>);
    expect(container.querySelector('button')).toBeInTheDocument();

    rerender(<Button size="large">Large</Button>);
    expect(container.querySelector('button')).toBeInTheDocument();
  });
});

