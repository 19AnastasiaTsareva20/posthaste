import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { Navigation } from '../Navigation';

const renderWithRouter = (component: React.ReactElement, initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  );
};

describe('Navigation', () => {
  it('renders all navigation links', () => {
    renderWithRouter(<Navigation />);
    
    expect(screen.getByRole('link', { name: /заметки/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /создать/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /архив/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /настройки/i })).toBeInTheDocument();
  });

  it('shows correct active link for articles page', () => {
    renderWithRouter(<Navigation />, ['/articles']);
    
    const articlesLink = screen.getByRole('link', { name: /заметки/i });
    expect(articlesLink).toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('shows correct active link for create page', () => {
    renderWithRouter(<Navigation />, ['/create']);
    
    const createLink = screen.getByRole('link', { name: /создать/i });
    expect(createLink).toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('shows correct active link for archive page', () => {
    renderWithRouter(<Navigation />, ['/archive']);
    
    const archiveLink = screen.getByRole('link', { name: /архив/i });
    expect(archiveLink).toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('shows correct active link for settings page', () => {
    renderWithRouter(<Navigation />, ['/settings']);
    
    const settingsLink = screen.getByRole('link', { name: /настройки/i });
    expect(settingsLink).toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('has proper icons for each link', () => {
    renderWithRouter(<Navigation />);
    
    const articlesLink = screen.getByRole('link', { name: /заметки/i });
    expect(articlesLink.querySelector('[data-icon="notes"]')).toBeInTheDocument();
    
    const createLink = screen.getByRole('link', { name: /создать/i });
    expect(createLink.querySelector('[data-icon="plus"]')).toBeInTheDocument();
    
    const archiveLink = screen.getByRole('link', { name: /архив/i });
    expect(archiveLink.querySelector('[data-icon="archive"]')).toBeInTheDocument();
    
    const settingsLink = screen.getByRole('link', { name: /настройки/i });
    expect(settingsLink.querySelector('[data-icon="settings"]')).toBeInTheDocument();
  });

  it('navigates to correct routes', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Navigation />);
    
    const createLink = screen.getByRole('link', { name: /создать/i });
    await user.click(createLink);
    
    expect(createLink).toHaveAttribute('href', '/create');
  });

  it('shows mobile navigation menu', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    renderWithRouter(<Navigation />);
    
    expect(screen.getByRole('button', { name: /меню/i })).toBeInTheDocument();
  });

  it('toggles mobile menu when menu button is clicked', async () => {
    const user = userEvent.setup();
    
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    renderWithRouter(<Navigation />);
    
    const menuButton = screen.getByRole('button', { name: /меню/i });
    await user.click(menuButton);
    
    // Проверяем, что мобильное меню стало видимым
    const mobileMenu = screen.getByRole('navigation');
    expect(mobileMenu).toHaveClass('block');
  });

  it('closes mobile menu when link is clicked', async () => {
    const user = userEvent.setup();
    
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    renderWithRouter(<Navigation />);
    
    const menuButton = screen.getByRole('button', { name: /меню/i });
    await user.click(menuButton);
    
    const articlesLink = screen.getByRole('link', { name: /заметки/i });
    await user.click(articlesLink);
    
    // Меню должно закрыться после клика по ссылке
    const mobileMenu = screen.getByRole('navigation');
    expect(mobileMenu).toHaveClass('hidden');
  });

  it('has proper accessibility attributes', () => {
    renderWithRouter(<Navigation />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Основная навигация');
    
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAttribute('aria-label');
    });
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Navigation />);
    
    const firstLink = screen.getByRole('link', { name: /заметки/i });
    firstLink.focus();
    
    expect(firstLink).toHaveFocus();
    
    await user.tab();
    expect(screen.getByRole('link', { name: /создать/i })).toHaveFocus();
    
    await user.tab();
    expect(screen.getByRole('link', { name: /архив/i })).toHaveFocus();
  });

  it('shows notification badges for archive count', () => {
    const propsWithArchiveCount = { archivedNotesCount: 3 };
    renderWithRouter(<Navigation {...propsWithArchiveCount} />);
    
    const archiveLink = screen.getByRole('link', { name: /архив/i });
    expect(archiveLink).toContainElement(screen.getByText('3'));
  });

  it('hides badge when archive count is zero', () => {
    const propsWithZeroArchive = { archivedNotesCount: 0 };
    renderWithRouter(<Navigation {...propsWithZeroArchive} />);
    
    const archiveLink = screen.getByRole('link', { name: /архив/i });
    expect(archiveLink).not.toContainElement(screen.queryByText('0'));
  });

  it('handles very large badge numbers', () => {
    const propsWithLargeCount = { archivedNotesCount: 99 };
    renderWithRouter(<Navigation {...propsWithLargeCount} />);
    
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('has hover effects on desktop', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Navigation />);
    
    const articlesLink = screen.getByRole('link', { name: /заметки/i });
    await user.hover(articlesLink);
    
    expect(articlesLink).toHaveClass('hover:bg-gray-50');
  });

  it('closes mobile menu on escape key', async () => {
    const user = userEvent.setup();
    
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    renderWithRouter(<Navigation />);
    
    const menuButton = screen.getByRole('button', { name: /меню/i });
    await user.click(menuButton);
    
    await user.keyboard('{Escape}');
    
    const mobileMenu = screen.getByRole('navigation');
    expect(mobileMenu).toHaveClass('hidden');
  });

  it('maintains accessibility during mobile menu transitions', async () => {
    const user = userEvent.setup();
    
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    renderWithRouter(<Navigation />);
    
    const menuButton = screen.getByRole('button', { name: /меню/i });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    
    await user.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  });
});
