import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TextPracticeCard } from './TextPracticeCard';

describe('TextPracticeCard', () => {
  it('runs a correct Romaji drill and shows the full ledger', async () => {
    const user = userEvent.setup();
    render(<TextPracticeCard onDataChanged={vi.fn()} />);
    expect(await screen.findByText(/Give the Japanese for “rain”/)).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Give the Japanese for “rain”/), 'ame');
    await user.click(screen.getByRole('button', { name: 'Check answer' }));
    expect(await screen.findByText('CORRECT')).toBeInTheDocument();
    expect(screen.getByText('雨')).toBeInTheDocument();
    expect(screen.getByText('rain')).toBeInTheDocument();
  });
});
