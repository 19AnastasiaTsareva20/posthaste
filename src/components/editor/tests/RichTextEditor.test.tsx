import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RichTextEditor } from '../RichTextEditor';

// Mock document.execCommand
document.execCommand = jest.fn();

// Mock getSelection
const mockSelection = {
  rangeCount: 1,
  getRangeAt: jest.fn().mockReturnValue({
    collapsed: false,
    startContainer: { nodeType: 3, textContent: 'test' },
    endContainer: { nodeType: 3, textContent: 'test' }
  }),
  removeAllRanges: jest.fn(),
  addRange: jest.fn()
};

global.getSelection = jest.fn().mockReturnValue(mockSelection);

describe('RichTextEditor', () => {
  const defaultProps = {
    value: '<p>Initial content</p>',
    onChange: jest.fn(),
    placeholder: 'Начните писать...'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders editor with initial content', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    expect(screen.getByText('Initial content')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows placeholder when empty', () => {
    render(<RichTextEditor {...defaultProps} value="" />);
    
    expect(screen.getByText('Начните писать...')).toBeInTheDocument();
  });

  it('calls onChange when content changes', async () => {
    const user = userEvent.setup();
    render(<RichTextEditor {...defaultProps} />);
    
    const editor = screen.getByRole('textbox');
    await user.click(editor);
    await user.type(editor, ' new text');
    
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it('renders formatting toolbar', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /жирный/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /курсив/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /подчеркивание/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /заголовок/i })).toBeInTheDocument();
  });

  it('applies bold formatting', async () => {
    const user = userEvent.setup();
    render(<RichTextEditor {...defaultProps} />);
    
    const boldButton = screen.getByRole('button', { name: /жирный/i });
    await user.click(boldButton);
    
    expect(document.execCommand).toHaveBeenCalledWith('bold', false, null);
  });

  it('applies italic formatting', async () => {
    const user = userEvent.setup();
    render(<RichTextEditor {...defaultProps} />);
    
    const italicButton = screen.getByRole('button', { name: /курсив/i });
    await user.click(italicButton);
    
    expect(document.execCommand).toHaveBeenCalledWith('italic', false, null);
  });

  it('applies underline formatting', async () => {
    const user = userEvent.setup();
    render(<RichTextEditor {...defaultProps} />);
    
    const underlineButton = screen.getByRole('button', { name: /подчеркивание/i });
    await user.click(underlineButton);
    
    expect(document.execCommand).toHaveBeenCalledWith('underline', false, null);
  });

  it('inserts unordered list', async () => {
    const user = userEvent.setup();
    render(<RichTextEditor {...defaultProps} />);
    
    const listButton = screen.getByRole('button', { name: /список/i });
    await user.click(listButton);
    
    expect(document.execCommand).toHaveBeenCalledWith('insertUnorderedList', false, null);
  });

  it('inserts ordered list', async () => {
    const user = userEvent.setup();
    render(<RichTextEditor {...defaultProps} />);
    
    const numberedListButton = screen.getByRole('button', { name: /нумерованный список/i });
    await user.click(numberedListButton);
    
    expect(document.execCommand).toHaveBeenCalledWith('insertOrderedList', false, null);
  });

  it('creates link', async () => {
    const user = userEvent.setup();
    window.prompt = jest.fn().mockReturnValue('https://example.com');
    
    render(<RichTextEditor {...defaultProps} />);
    
    const linkButton = screen.getByRole('button', { name: /ссылка/i });
    await user.click(linkButton);
    
    expect(window.prompt).toHaveBeenCalledWith('Введите URL:');
    expect(document.execCommand).toHaveBeenCalledWith('createLink', false, 'https://example.com');
  });

  it('handles keyboard shortcuts', async () => {
    const user = userEvent.setup();
    render(<RichTextEditor {...defaultProps} />);
    
    const editor = screen.getByRole('textbox');
    await user.click(editor);
    
    // Ctrl+B for bold
    await user.keyboard('{Control>}b{/Control}');
    expect(document.execCommand).toHaveBeenCalledWith('bold', false, null);
    
    // Ctrl+I for italic
    await user.keyboard('{Control>}i{/Control}');
    expect(document.execCommand).toHaveBeenCalledWith('italic', false, null);
    
    // Ctrl+U for underline
    await user.keyboard('{Control>}u{/Control}');
    expect(document.execCommand).toHaveBeenCalledWith('underline', false, null);
  });

  it('prevents default behavior for some keys', async () => {
    const user = userEvent.setup();
    render(<RichTextEditor {...defaultProps} />);
    
    const editor = screen.getByRole('textbox');
    await user.click(editor);
    
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    const preventDefaultSpy = jest.spyOn(tabEvent, 'preventDefault');
    
    fireEvent.keyDown(editor, tabEvent);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('updates formatting button states based on cursor position', async () => {
    const user = userEvent.setup();
    
    // Mock queryCommandState
    document.queryCommandState = jest.fn()
      .mockReturnValueOnce(true)  // bold
      .mockReturnValueOnce(false) // italic
      .mockReturnValueOnce(false); // underline
    
    render(<RichTextEditor {...defaultProps} />);
    
    const editor = screen.getByRole('textbox');
    await user.click(editor);
    
    const boldButton = screen.getByRole('button', { name: /жирный/i });
    expect(boldButton).toHaveClass('bg-blue-100'); // активное состояние
  });

  it('handles paste events', async () => {
    const user = userEvent.setup();
    render(<RichTextEditor {...defaultProps} />);
    
    const editor = screen.getByRole('textbox');
    await user.click(editor);
    
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: new DataTransfer()
    });
    
    pasteEvent.clipboardData?.setData('text/html', '<strong>pasted content</strong>');
    
    fireEvent.paste(editor, pasteEvent);
    
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it('has accessible toolbar buttons', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('title');
    });
  });

  it('focuses editor when focus method is called', () => {
    const ref = React.createRef<any>();
    render(<RichTextEditor {...defaultProps} ref={ref} />);
    
    ref.current?.focus();
    
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('handles undo and redo', async () => {
    const user = userEvent.setup();
    render(<RichTextEditor {...defaultProps} />);
    
    const undoButton = screen.getByRole('button', { name: /отменить/i });
    const redoButton = screen.getByRole('button', { name: /повторить/i });
    
    await user.click(undoButton);
    expect(document.execCommand).toHaveBeenCalledWith('undo', false, null);
    
    await user.click(redoButton);
    expect(document.execCommand).toHaveBeenCalledWith('redo', false, null);
  });
});
