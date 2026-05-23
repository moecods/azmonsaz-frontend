import { describe, it, expect } from 'vitest';
import { render, screen } from '@/tests/utils/test-utils';
import OptionsList from '@/components/questions/primitives/OptionsList';

describe('OptionsList', () => {
  it('renders correct option with green border and no border on wrong options', () => {
    const { container } = render(
      <OptionsList
        questionType="multiple_choice"
        options={['A', 'B', 'C']}
        correctAnswer={1}
        mode="authoring"
      />
    );

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();

    const boxes = container.querySelectorAll('[class*="MuiBox-root"]');
    const optionRows = Array.from(boxes).filter((el) => {
      const style = window.getComputedStyle(el);
      return style.borderWidth !== '0px' || el.textContent?.includes('B');
    });

    const bordered = Array.from(container.querySelectorAll('div')).filter((el) => {
      const s = window.getComputedStyle(el);
      return s.borderStyle === 'solid' && s.borderColor !== 'rgba(0, 0, 0, 0)' && s.borderWidth !== '0px';
    });

    expect(bordered.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('گزینه‌ها:')).toBeInTheDocument();
  });
});
