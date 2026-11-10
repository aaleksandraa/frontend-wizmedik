// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  classifyDoctorLoadError,
  classifyDoctorPayload,
  doctorSlugFromPath,
  profileShell,
  reconcileSeoSnapshot,
  snapshotMatchesSlug,
} from './seo-snapshot';

function page(snapshotSlug: string | null, rootHtml = '') {
  document.body.innerHTML = `
    ${snapshotSlug === null ? '' : `<main id="seo-snapshot" data-doctor-slug="${snapshotSlug}"><article><h1>Dr. Ana Ivić</h1><p>Kardiologija · Sarajevo</p></article></main>`}
    <div id="root">${rootHtml}</div>
  `;
  return document;
}

describe('doctor seo snapshot lifecycle', () => {
  it('keeps the server summary while the matching profile is loading', () => {
    const doc = page('ana-ivic');

    expect(snapshotMatchesSlug('ana-ivic', doc)).toBe(true);
    expect(profileShell('loading', true)).toBe('snapshot-only');
    expect(reconcileSeoSnapshot({ slug: 'ana-ivic', phase: 'loading' }, doc)).toBe('kept');
    expect(doc.querySelectorAll('h1')).toHaveLength(1);
    expect(doc.getElementById('seo-snapshot')).not.toBeNull();
  });

  it('removes the snapshot only after the matching profile heading is committed', () => {
    const doc = page('ana-ivic', '<h1>Dr. Ana Ivić</h1>');

    expect(reconcileSeoSnapshot({
      slug: 'ana-ivic',
      phase: 'ready',
      doctorName: 'Dr. Ana Ivić',
    }, doc)).toBe('removed');
    expect(doc.getElementById('seo-snapshot')).toBeNull();
    expect(doc.querySelectorAll('h1')).toHaveLength(1);
    expect(doc.querySelector('#root h1')?.textContent).toContain('Ana Ivić');
  });

  it('keeps the snapshot when React has not committed the doctor heading', () => {
    const doc = page('ana-ivic', '<h1>Učitavanje profila</h1>');

    expect(reconcileSeoSnapshot({
      slug: 'ana-ivic',
      phase: 'ready',
      doctorName: 'Dr. Ana Ivić',
    }, doc)).toBe('kept');
    expect(doc.querySelectorAll('h1')).toHaveLength(2);
  });

  it('keeps the snapshot on a temporary API failure and avoids a not-found shell', () => {
    const doc = page('ana-ivic');

    expect(profileShell('unavailable', true)).toBe('unavailable-with-snapshot');
    expect(reconcileSeoSnapshot({ slug: 'ana-ivic', phase: 'unavailable' }, doc)).toBe('kept');
    expect(doc.querySelector('h1')?.textContent).toContain('Ana Ivić');
  });

  it('removes the snapshot for a confirmed missing doctor', () => {
    const doc = page('ana-ivic', '<h1>Doktor nije pronađen</h1>');

    expect(profileShell('not_found', true)).toBe('not-found');
    expect(reconcileSeoSnapshot({ slug: 'ana-ivic', phase: 'not_found' }, doc)).toBe('removed');
    expect(doc.getElementById('seo-snapshot')).toBeNull();
    expect(doc.querySelectorAll('h1')).toHaveLength(1);
    expect(doc.querySelector('#root h1')?.textContent).toContain('nije pronađen');
  });

  it('removes a snapshot that belongs to another doctor during client navigation', () => {
    const doc = page('ana-ivic');

    expect(profileShell('loading', false)).toBe('skeleton');
    expect(reconcileSeoSnapshot({ slug: 'marko-horvat', phase: 'loading' }, doc)).toBe('removed');
    expect(doc.getElementById('seo-snapshot')).toBeNull();
  });

  it('leaves the initial HTML untouched when JavaScript does not run', () => {
    const doc = page('ana-ivic');

    expect(doc.querySelector('main#seo-snapshot h1')?.textContent).toBe('Dr. Ana Ivić');
    expect(doc.querySelector('#root')?.textContent).toBe('');
    expect(doc.querySelectorAll('main')).toHaveLength(1);
  });

  it('classifies a missing doctor separately from a failed request', () => {
    expect(classifyDoctorLoadError({ response: { status: 404 } })).toBe('not_found');
    expect(classifyDoctorLoadError({ response: { status: 500 } })).toBe('unavailable');
    expect(classifyDoctorLoadError(new Error('Network Error'))).toBe('unavailable');
    expect(classifyDoctorPayload({ ime: 'Ana', prezime: 'Ivić' })).toBe('ready');
    expect(classifyDoctorPayload({ ime: 'Ana' })).toBe('unavailable');
    expect(classifyDoctorPayload(null)).toBe('unavailable');
    expect(doctorSlugFromPath('/doktor/ana-ivic')).toBe('ana-ivic');
    expect(doctorSlugFromPath('/doktori')).toBeNull();
  });

  it('moves focus to the committed profile heading when removing a focused snapshot', () => {
    const doc = page('ana-ivic', '<h1>Dr. Ana Ivić</h1>');
    const link = doc.createElement('a');
    link.href = '/doktor/ana-ivic';
    link.textContent = 'Profil doktora';
    doc.querySelector('#seo-snapshot article')?.appendChild(link);
    link.focus();

    reconcileSeoSnapshot({
      slug: 'ana-ivic',
      phase: 'ready',
      doctorName: 'Dr. Ana Ivić',
    }, doc);

    expect(doc.activeElement).toBe(doc.querySelector('#root h1'));
    expect(doc.querySelector('#root h1')?.getAttribute('tabindex')).toBe('-1');
  });
});
