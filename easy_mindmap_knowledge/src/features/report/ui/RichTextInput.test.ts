import { describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { renderWithI18n } from '@/testing/render-with-i18n';
import { MAX_BODY } from '../logic/report-draft';
import RichTextInput from './RichTextInput.svelte';

const box = () => screen.getByRole('textbox') as HTMLTextAreaElement;
const mount = (value = '') => renderWithI18n(RichTextInput, { value, placeholder: 'Write here' });
const set = (el: HTMLTextAreaElement, value: string) => fireEvent.input(el, { target: { value } });

describe('RichTextInput', () => {
  it('has a labelled textarea with the placeholder and a 0/1500 counter', () => {
    mount();
    expect(box()).toHaveAccessibleName('Report text');
    expect(box()).toHaveAttribute('placeholder', 'Write here');
    expect(screen.getByText(`0/${MAX_BODY}`)).toBeInTheDocument();
  });
  it('does not announce the counter on every keystroke; only the limit note is a live region', async () => {
    mount();
    const counter = screen.getByText(`0/${MAX_BODY}`);
    expect(counter.closest('[aria-live]')).toBeNull();
    expect(counter.closest('[role="status"]')).toBeNull();
    await set(box(), 'a'.repeat(MAX_BODY));
    await set(box(), 'a'.repeat(MAX_BODY) + 'b');
    expect(screen.getByRole('status')).toHaveTextContent('Character limit of 1500 reached.');
  });
  it('puts the text box first, so it is the first control focused when the dialog opens', () => {
    mount();
    const order = screen.getAllByRole('textbox').concat(screen.getAllByRole('button'));
    expect(box().compareDocumentPosition(order[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
  it('does not use the maxlength attribute (it counts UTF-16 units, not visible characters)', () => {
    mount();
    expect(box()).not.toHaveAttribute('maxlength');
  });
  it('counts visible characters: markers are free', async () => {
    mount();
    await set(box(), '**bold** and _it_');
    expect(screen.getByText('11/1500')).toBeInTheDocument();
  });
  it('accepts exactly 1500 and rejects an edit past it', async () => {
    mount();
    await set(box(), 'a'.repeat(MAX_BODY));
    expect(screen.getByText('1500/1500')).toBeInTheDocument();
    await set(box(), 'a'.repeat(MAX_BODY) + 'b');
    expect(box().value).toBe('a'.repeat(MAX_BODY));
    expect(screen.getByText('1500/1500')).toBeInTheDocument();
    expect(screen.getByText('Character limit of 1500 reached.')).toBeInTheDocument();
  });
  it('counts an emoji as one character, not two UTF-16 units', async () => {
    mount();
    await set(box(), '😀'.repeat(MAX_BODY));
    expect(screen.getByText('1500/1500')).toBeInTheDocument();
  });
  it('still allows deleting and typing when the limit was hit', async () => {
    mount();
    await set(box(), 'a'.repeat(MAX_BODY));
    await set(box(), 'a'.repeat(MAX_BODY) + 'b');
    await set(box(), 'a'.repeat(MAX_BODY - 1));
    expect(screen.getByText('1499/1500')).toBeInTheDocument();
    expect(screen.queryByText('Character limit of 1500 reached.')).toBeNull();
  });
  it('bold, italic and list buttons have aria-labels and edit the selection', async () => {
    mount('hello world');
    box().setSelectionRange(0, 5);
    await userEvent.click(screen.getByRole('button', { name: 'Bold' }));
    await waitFor(() => expect(box().value).toBe('**hello** world'));
    expect(screen.getByText('11/1500')).toBeInTheDocument();
    box().setSelectionRange(10, 15);
    await userEvent.click(screen.getByRole('button', { name: 'Italic' }));
    await waitFor(() => expect(box().value).toBe('**hello** _world_'));
    await userEvent.click(screen.getByRole('button', { name: 'List' }));
    await waitFor(() => expect(box().value).toBe('- **hello** _world_'));
    expect(screen.getByText('11/1500')).toBeInTheDocument();
  });
  it('keeps the caret in the textarea after a toolbar action', async () => {
    mount('hello');
    box().setSelectionRange(0, 5);
    await userEvent.click(screen.getByRole('button', { name: 'Bold' }));
    await waitFor(() => expect(document.activeElement).toBe(box()));
  });
});
