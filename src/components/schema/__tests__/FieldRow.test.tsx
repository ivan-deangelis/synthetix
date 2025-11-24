import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FieldRow from '../FieldRow';
import { SchemaField } from '@/types/schema';

describe('FieldRow', () => {
  const mockField: SchemaField = {
    id: '1',
    name: 'testField',
    type: 'string',
    required: true,
    fakerType: 'person.fullName',
  };

  const mockOnUpdate = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnAddChild = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render field name input', () => {
    render(
      <FieldRow 
        field={mockField} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete}
      />
    );
    
    const input = screen.getByDisplayValue('testField');
    expect(input).toBeInTheDocument();
  });

  it('should render type dropdown', () => {
    render(
      <FieldRow 
        field={mockField} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete}
      />
    );
    
    // Check if the string type is selected
    expect(screen.getByDisplayValue('String')).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <FieldRow 
        field={mockField} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete}
      />
    );
    
    const deleteButton = screen.getByTitle('Remove Field');
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('should render Faker type selector for string fields', () => {
    render(
      <FieldRow 
        field={mockField} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete}
      />
    );
    
    // The Faker dropdown should be present
    const fakerSelects = screen.getAllByRole('combobox');
    expect(fakerSelects.length).toBeGreaterThan(1);
  });

  it('should be disabled when readOnly prop is true', () => {
    render(
      <FieldRow 
        field={mockField} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete}
        readOnly={true}
      />
    );
    
    const nameInput = screen.getByDisplayValue('testField');
    expect(nameInput).toBeDisabled();
  });

  it('should show AI instruction button when enableAI is true', () => {
    render(
      <FieldRow 
        field={mockField} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete}
        enableAI={true}
      />
    );
    
    const aiButton = screen.getByTitle('Add AI Instruction');
    expect(aiButton).toBeInTheDocument();
  });

  it('should hide AI instruction button when enableAI is false', () => {
    render(
      <FieldRow 
        field={mockField} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete}
        enableAI={false}
      />
    );
    
    const aiButton = screen.queryByTitle('Add AI Instruction');
    expect(aiButton).not.toBeInTheDocument();
  });
});
