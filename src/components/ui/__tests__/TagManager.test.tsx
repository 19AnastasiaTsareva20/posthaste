import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagManager } from '../TagManager';

describe('TagManager', () => {
  const defaultProps = {
    tags: ['work', 'important'],
    onChange: jest.fn(),
    suggestions: ['work', 'personal', 'ideas', 'important', 'project']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders existing tags', () => {
    render(<TagManager {...defaultProps} />);
    
    expect(screen.getByText('#work')).toBeInTheDocument();
    expect(screen.getByText('#important')).toBeInTheDocument();
  });

  it('adds new tag when Enter is pressed', async () => {
    const user = userEvent.setup();
    render(<TagManager {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/добавить тег/i);
    await user.type(input, 'newTag');
    await user.keyboard('{Enter}');
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(['work', 'important', 'newtag']);
    expect(input).toHaveValue('');
  });

  it('adds new tag when comma is typed', async () => {
    const user = userEvent.setup();
    render(<TagManager {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/добавить тег/i);
    await user.type(input, 'newTag,');
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(['work', 'important', 'newtag']);
  });

  it('removes tag when remove button is clicked', async () => {
    const user = userEvent.setup();
    render(<TagManager {...defaultProps} />);
    
    const removeButton = screen.getByRole('button', { name: /удалить тег work/i });
    await user.click(removeButton);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(['important']);
  });

  it('shows tag suggestions when typing', async () => {
    const user = userEvent.setup();
    render(<TagManager {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/добавить тег/i);
    await user.type(input, 'p');
    
    await waitFor(() => {
      expect(screen.getByText('personal')).toBeInTheDocument();
      expect(screen.getByText('project')).toBeInTheDocument();
    });
  });

  it('filters suggestions based on input', async () => {
    const user = userEvent.setup();
    render(<TagManager {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/добавить тег/i);
    await user.type(input, 'per');
    
    await waitFor(() => {
      expect(screen.getByText('personal')).toBeInTheDocument();
      expect(screen.queryByText('project')).not.toBeInTheDocument();
    });
  });

  it('excludes already added tags from suggestions', async () => {
    const user = userEvent.setup();
    render(<TagManager {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/добавить тег/i);
    await user.type(input, 'w');
    
    await waitFor(() => {
      // 'work' уже добавлен, поэтому не должен появляться в предложениях
      expect(screen.queryByText('work')).not.toBeInTheDocument();
    });
  });

  it('adds tag from suggestions when clicked', async () => {
    const user = userEvent.setup();
    render(<TagManager {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/добавить тег/i);
    await user.type(input, 'p');
    
    await waitFor(() => {
      expect(screen.getByText('personal')).toBeInTheDocument();
    });
    
    const suggestionItem = screen.getByText('personal');
    await user.click(suggestionItem);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(['work', 'important', 'personal']);
    expect(input).toHaveValue('');
  });

  it('navigates suggestions with keyboard', async () => {
    const user = userEvent.setup();
    render(<TagManager {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/добавить тег/i);
    await user.type(input, 'p');
    
    await waitFor(() => {
      expect(screen.getByText('personal')).toBeInTheDocument();
    });
    
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(['work', 'important', 'personal']);
  });

  it('prevents duplicate tags', async () => {
    const user = userEvent.setup();
    render(<TagManager {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/добавить тег/i);
    await user.type(input, 'work');
    await user.keyboard('{Enter}');
    
    expect(defaultProps.onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/тег уже существует/i)).toBeInTheDocument();
  });

  it('trims whitespace from tags', async () => {
    const user = userEvent.setup();
    render(<TagManager {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/добавить тег/i);
    await user.type(input, '  spaced  ');
    await user.keyboard('{Enter}');
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(['work', 'important', 'spaced']);
  });

  it('converts tags to lowercase', async () => {
    const user = userEvent.setup();
    render(<TagManager {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/добавить тег/i);
    await user.type(input, 'UpperCase');
    await user.keyboard('{Enter}');
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(['work', 'important', 'uppercase']);
  });

  it('ignores empty tags', async () => {
    const user = userEvent.setup();
    render(<TagManager {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/добавить тег/i);
    await user.type(input, '   ');
    await user.keyboard('{Enter}');
    
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('shows maximum tag limit warning', async () => {
    const manyTags = Array.from({ length: 10 }, (_, i) => `tag${i}`);
    const user = userEvent.setup();
    
    render(<TagManager {...defaultProps} tags={manyTags} />);
    
    const input = screen.getByPlaceholderText(/добавить тег/i);
    await user.type(input, 'newTag');
    await user.keyboard('{Enter}');
    
    expect(screen.getByText(/максимум тегов/i)).toBeInTheDocument();
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('supports custom tag colors', () => {
    const customProps = {
      ...defaultProps,
      tagColors: { work: 'blue', important: 'red' }
    };
    
    render(<TagManager {...customProps} />);
    
    const workTag = screen.getByText('#work');
    expect(workTag.parentElement).toHaveClass('bg-blue-100');
    
    const importantTag = screen.getByText('#important');
    expect(importantTag.parentElement).toHaveClass('bg-red-100');
  });
});
