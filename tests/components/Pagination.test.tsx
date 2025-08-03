import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import React from 'react';
import Pagination from '../../src/components/Pagination/Pagination';

describe('Pagination Component', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    onPageChange: vi.fn(),
  };

  it('renders pagination with correct page numbers', () => {
    render(<Pagination {...defaultProps} />);

    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('applies active class to current page', () => {
    render(<Pagination {...defaultProps} />);

    const currentPageButton = screen.getByText('1');
    expect(currentPageButton).toHaveClass('active');

    const otherPageButton = screen.getByText('2');
    expect(otherPageButton).not.toHaveClass('active');
  });

  it('disables Previous button on first page', () => {
    render(<Pagination {...defaultProps} />);

    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeDisabled();
  });

  it('enables Previous button when not on first page', () => {
    render(<Pagination {...defaultProps} currentPage={2} />);

    const prevButton = screen.getByText('Previous');
    expect(prevButton).not.toBeDisabled();
  });

  it('disables Next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} />);

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('enables Next button when not on last page', () => {
    render(<Pagination {...defaultProps} />);

    const nextButton = screen.getByText('Next');
    expect(nextButton).not.toBeDisabled();
  });

  it('calls onPageChange when page number button is clicked', () => {
    const mockOnPageChange = vi.fn();
    render(<Pagination {...defaultProps} onPageChange={mockOnPageChange} />);

    const pageButton = screen.getByText('3');
    fireEvent.click(pageButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange with current page + 1 when Next is clicked', () => {
    const mockOnPageChange = vi.fn();
    render(<Pagination {...defaultProps} onPageChange={mockOnPageChange} />);

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with current page - 1 when Previous is clicked', () => {
    const mockOnPageChange = vi.fn();
    render(
      <Pagination
        {...defaultProps}
        currentPage={3}
        onPageChange={mockOnPageChange}
      />
    );

    const prevButton = screen.getByText('Previous');
    fireEvent.click(prevButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('displays correct page info text', () => {
    render(<Pagination {...defaultProps} currentPage={2} />);

    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
  });

  it('does not render when totalPages is 1', () => {
    const { container } = render(
      <Pagination {...defaultProps} totalPages={1} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
