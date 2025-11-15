import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ButtonEditModal } from './ButtonEditModal';
import { ActionButton as ActionButtonType } from '../lib/platform-api';

describe('Button Customization - Color and Font Settings', () => {
  let mockButton: ActionButtonType;
  let mockOnClose: ReturnType<typeof vi.fn>;
  let mockOnSave: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockButton = {
      position: { row: 1, col: 1 },
      action_type: 'LaunchApp',
      label: 'Test Button',
      icon: '🚀',
      config: {
        path: 'notepad.exe',
      },
      style: {
        background_color: '#3b82f6',
        text_color: '#ffffff',
        font_size: 14,
        font_family: 'Arial, sans-serif',
      },
    };

    mockOnClose = vi.fn();
    mockOnSave = vi.fn().mockResolvedValue(undefined);
  });

  describe('Background Color Customization', () => {
    it('should display current background color', () => {
      render(
        <ButtonEditModal
          button={mockButton}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const colorInput = screen.getByLabelText('Background Color') as HTMLInputElement;
      expect(colorInput.value).toBe('#3b82f6');
    });

    it('should allow changing background color via color picker', async () => {
      render(
        <ButtonEditModal
          button={mockButton}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const colorInput = screen.getByLabelText('Background Color') as HTMLInputElement;
      fireEvent.change(colorInput, { target: { value: '#ff0000' } });

      // Verify the preview updates
      const preview = document.querySelector('.button-preview') as HTMLElement;
      await waitFor(() => {
        expect(preview.style.backgroundColor).toBe('rgb(255, 0, 0)');
      });
    });

    it('should allow changing background color via text input', async () => {
      render(
        <ButtonEditModal
          button={mockButton}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const textInputs = screen.getAllByPlaceholderText('#3b82f6');
      const colorTextInput = textInputs[0] as HTMLInputElement;
      
      fireEvent.change(colorTextInput, { target: { value: '#00ff00' } });

      const preview = document.querySelector('.button-preview') as HTMLElement;
      await waitFor(() => {
        expect(preview.style.backgroundColor).toBe('rgb(0, 255, 0)');
      });
    });

    it('should save button with new background color', async () => {
      render(
        <ButtonEditModal
          button={mockButton}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const colorInput = screen.getByLabelText('Background Color') as HTMLInputElement;
      fireEvent.change(colorInput, { target: { value: '#ff0000' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            style: expect.objectContaining({
              background_color: '#ff0000',
            }),
          })
        );
      });
    });
  });

  describe('Text Color Customization', () => {
    it('should display current text color', () => {
      render(
        <ButtonEditModal
          button={mockButton}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const colorInput = screen.getByLabelText('Text Color') as HTMLInputElement;
      expect(colorInput.value).toBe('#ffffff');
    });

    it('should allow changing text color via color picker', async () => {
      render(
        <ButtonEditModal
          button={mockButton}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const colorInput = screen.getByLabelText('Text Color') as HTMLInputElement;
      fireEvent.change(colorInput, { target: { value: '#000000' } });

      const preview = document.querySelector('.button-preview') as HTMLElement;
      await waitFor(() => {
        expect(preview.style.color).toBe('rgb(0, 0, 0)');
      });
    });

    it('should allow changing text color via text input', async () => {
      render(
        <ButtonEditModal
          button={mockButton}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const textInputs = screen.getAllByPlaceholderText('#ffffff');
      const colorTextInput = textInputs[0] as HTMLInputElement;
      
      fireEvent.change(colorTextInput, { target: { value: '#ff00ff' } });

      const preview = document.querySelector('.button-preview') as HTMLElement;
      await waitFor(() => {
        expect(preview.style.color).toBe('rgb(255, 0, 255)');
      });
    });

    it('should save button with new text color', async () => {
      render(
        <ButtonEditModal
          button={mockButton}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const colorInput = screen.getByLabelText('Text Color') as HTMLInputElement;
      fireEvent.change(colorInput, { target: { value: '#000000' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            style: expect.objectContaining({
              text_color: '#000000',
            }),
          })
        );
      });
    });
  });

  describe('Font Size Customization', () => {
    it('should display current font size', () => {
      render(
        <ButtonEditModal
          button={mockButton}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const fontSizeInput = screen.getByLabelText('Font Size (px)') as HTMLInputElement;
      expect(fontSizeInput.value).toBe('14');
    });

    it('should allow changing font size', async () => {
      render(
        <ButtonEditModal
          button={mockButton}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const fontSizeInput = screen.getByLabelText('Font Size (px)') as HTMLInputElement;
      fireEvent.change(fontSizeInput, { target: { value: '20' } });

      const preview = document.querySelector('.button-preview') as HTMLElement;
      await waitFor(() => {
        expect(preview.style.fontSize).toBe('20px');
      });
    });

    it('should save button with new font size', async () => {
      render(
        <ButtonEditModal
          button={mockButton}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const fontSizeInput = screen.getByLabelText('Font Size (px)') as HTMLInputElement;
      fireEvent.change(fontSizeInput, { target: { value: '18' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            style: expect.objectContaining({
              font_size: 18,
            }),
          })
        );
      });
    });
  });

  describe('Font Family Customization', () => {
    it('should display current font family', () => {
      render(
        <ButtonEditModal
          button={mockButton}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const fontFamilySelect = screen.getByLabelText('Font Family') as HTMLSelectElement;
      expect(fontFamilySelect.value).toBe('Arial, sans-serif');
    });

    it('should allow changing font family', async () => {
      render(
        <ButtonEditModal
          button={mockButton}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const fontFamilySelect = screen.getByLabelText('Font Family') as HTMLSelectElement;
      fireEvent.change(fontFamilySelect, { target: { value: "'Courier New', monospace" } });

      const preview = document.querySelector('.button-preview') as HTMLElement;
      await waitFor(() => {
        // Browser normalizes quotes, so check if it contains the font name
        expect(preview.style.fontFamily).toContain('Courier New');
        expect(preview.style.fontFamily).toContain('monospace');
      });
    });

    it('should save button with new font family', async () => {
      render(
        <ButtonEditModal
          button={mockButton}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const fontFamilySelect = screen.getByLabelText('Font Family') as HTMLSelectElement;
      fireEvent.change(fontFamilySelect, { target: { value: "'Verdana', sans-serif" } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            style: expect.objectContaining({
              font_family: "'Verdana', sans-serif",
            }),
          })
        );
      });
    });
  });

  describe('Modal Interaction', () => {
    it('should close modal when cancel button is clicked', () => {
      render(
        <ButtonEditModal
          button={mockButton}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close modal when X button is clicked', () => {
      render(
        <ButtonEditModal
          button={mockButton}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close modal when Escape key is pressed', () => {
      render(
        <ButtonEditModal
          button={mockButton}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const modal = document.querySelector('.button-edit-modal') as HTMLElement;
      fireEvent.keyDown(modal, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should show preview of all changes', async () => {
      render(
        <ButtonEditModal
          button={mockButton}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Change background color
      const bgColorInput = screen.getByLabelText('Background Color') as HTMLInputElement;
      fireEvent.change(bgColorInput, { target: { value: '#ff0000' } });

      // Change text color
      const textColorInput = screen.getByLabelText('Text Color') as HTMLInputElement;
      fireEvent.change(textColorInput, { target: { value: '#00ff00' } });

      // Change font size
      const fontSizeInput = screen.getByLabelText('Font Size (px)') as HTMLInputElement;
      fireEvent.change(fontSizeInput, { target: { value: '24' } });

      // Change font family
      const fontFamilySelect = screen.getByLabelText('Font Family') as HTMLSelectElement;
      fireEvent.change(fontFamilySelect, { target: { value: "'Courier New', monospace" } });

      const preview = document.querySelector('.button-preview') as HTMLElement;
      await waitFor(() => {
        expect(preview.style.backgroundColor).toBe('rgb(255, 0, 0)');
        expect(preview.style.color).toBe('rgb(0, 255, 0)');
        expect(preview.style.fontSize).toBe('24px');
        // Browser normalizes quotes, so check if it contains the font name
        expect(preview.style.fontFamily).toContain('Courier New');
        expect(preview.style.fontFamily).toContain('monospace');
      });
    });
  });

  describe('Button without existing style', () => {
    it('should handle button without style property', () => {
      const buttonWithoutStyle: ActionButtonType = {
        ...mockButton,
        style: undefined,
      };

      render(
        <ButtonEditModal
          button={buttonWithoutStyle}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Should use default values
      const bgColorInput = screen.getByLabelText('Background Color') as HTMLInputElement;
      expect(bgColorInput.value).toBe('#3b82f6');

      const textColorInput = screen.getByLabelText('Text Color') as HTMLInputElement;
      expect(textColorInput.value).toBe('#ffffff');

      const fontSizeInput = screen.getByLabelText('Font Size (px)') as HTMLInputElement;
      expect(fontSizeInput.value).toBe('14');
    });

    it('should create style object when saving button without existing style', async () => {
      const buttonWithoutStyle: ActionButtonType = {
        ...mockButton,
        style: undefined,
      };

      render(
        <ButtonEditModal
          button={buttonWithoutStyle}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const bgColorInput = screen.getByLabelText('Background Color') as HTMLInputElement;
      fireEvent.change(bgColorInput, { target: { value: '#ff0000' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            style: expect.objectContaining({
              background_color: '#ff0000',
            }),
          })
        );
      });
    });
  });
});
