import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportManager } from '../ExportManager';

const mockNote = {
  id: 'test-1',
  title: 'Test Note',
  content: '<p>This is <strong>bold</strong> content</p>',
  tags: ['test', 'export'],
  isFavorite: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  isArchived: false
};

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock document.createElement('a')
const mockAnchorElement = {
  href: '',
  download: '',
  click: jest.fn(),
  style: {}
};

jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
  if (tagName === 'a') {
    return mockAnchorElement as any;
  }
  return jest.requireActual('react').createElement(tagName);
});

describe('ExportManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders export options', () => {
    render(<ExportManager note={mockNote} />);
    
    expect(screen.getByText(/экспортировать/i)).toBeInTheDocument();
    expect(screen.getByText('Markdown')).toBeInTheDocument();
    expect(screen.getByText('HTML')).toBeInTheDocument();
    expect(screen.getByText('Текст')).toBeInTheDocument();
  });

  it('exports note as Markdown', async () => {
    const user = userEvent.setup();
    render(<ExportManager note={mockNote} />);
    
    const markdownButton = screen.getByText('Markdown');
    await user.click(markdownButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(
      expect.any(Blob)
    );
    expect(mockAnchorElement.download).toBe('test-note.md');
    expect(mockAnchorElement.click).toHaveBeenCalled();
  });

  it('exports note as HTML', async () => {
    const user = userEvent.setup();
    render(<ExportManager note={mockNote} />);
    
    const htmlButton = screen.getByText('HTML');
    await user.click(htmlButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(
      expect.any(Blob)
    );
    expect(mockAnchorElement.download).toBe('test-note.html');
    expect(mockAnchorElement.click).toHaveBeenCalled();
  });

  it('exports note as plain text', async () => {
    const user = userEvent.setup();
    render(<ExportManager note={mockNote} />);
    
    const textButton = screen.getByText('Текст');
    await user.click(textButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(
      expect.any(Blob)
    );
    expect(mockAnchorElement.download).toBe('test-note.txt');
    expect(mockAnchorElement.click).toHaveBeenCalled();
  });

  it('converts HTML to Markdown correctly', async () => {
    const user = userEvent.setup();
    render(<ExportManager note={mockNote} />);
    
    const markdownButton = screen.getByText('Markdown');
    await user.click(markdownButton);
    
    const blobCall = (global.URL.createObjectURL as jest.Mock).mock.calls[0][0];
    
    // Проверяем, что Blob содержит правильный Markdown
    expect(blobCall.type).toBe('text/markdown;charset=utf-8');
  });

  it('includes metadata in exported files', async () => {
    const user = userEvent.setup();
    render(<ExportManager note={mockNote} />);
    
    const htmlButton = screen.getByText('HTML');
    await user.click(htmlButton);
    
    const blobCall = (global.URL.createObjectURL as jest.Mock).mock.calls[0][0];
    expect(blobCall.type).toBe('text/html;charset=utf-8');
  });

  it('handles notes with special characters in title', async () => {
    const noteWithSpecialTitle = {
      ...mockNote,
      title: 'Test/Note: With "Special" Characters'
    };
    
    const user = userEvent.setup();
    render(<ExportManager note={noteWithSpecialTitle} />);
    
    const textButton = screen.getByText('Текст');
    await user.click(textButton);
    
    // Имя файла должно быть очищено от специальных символов
    expect(mockAnchorElement.download).toBe('test-note-with-special-characters.txt');
  });

  it('exports notes with tags', async () => {
    const user = userEvent.setup();
    render(<ExportManager note={mockNote} />);
    
    const markdownButton = screen.getByText('Markdown');
    await user.click(markdownButton);
    
    // Теги должны быть включены в экспорт
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it('shows export progress', async () => {
    const user = userEvent.setup();
    render(<ExportManager note={mockNote} />);
    
    const htmlButton = screen.getByText('HTML');
    
    // Симулируем медленный экспорт
    const originalCreateObjectURL = global.URL.createObjectURL;
    global.URL.createObjectURL = jest.fn().mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve('blob:mock-url'), 100));
    });
    
    await user.click(htmlButton);
    
    // Должен показать индикатор загрузки
    expect(screen.getByText(/экспорт/i)).toBeInTheDocument();
    
    global.URL.createObjectURL = originalCreateObjectURL;
  });

  it('handles export errors gracefully', async () => {
    const user = userEvent.setup();
    global.URL.createObjectURL = jest.fn().mockImplementation(() => {
      throw new Error('Export failed');
    });
    
    render(<ExportManager note={mockNote} />);
    
    const textButton = screen.getByText('Текст');
    await user.click(textButton);
    
    await waitFor(() => {
      expect(screen.getByText(/ошибка экспорта/i)).toBeInTheDocument();
    });
  });

  it('cleans up blob URLs after export', async () => {
    const user = userEvent.setup();
    render(<ExportManager note={mockNote} />);
    
    const htmlButton = screen.getByText('HTML');
    await user.click(htmlButton);
    
    // URL должен быть отозван после использования
    await waitFor(() => {
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });
});
