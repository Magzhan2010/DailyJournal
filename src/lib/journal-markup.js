/**
 * The raw-markup helpers — LiveJournal stored posts as HTML, so we do too.
 */

/** Strips the tags LiveJournal wraps around a post, so we can tell if it is empty. */
export function isEmptyMarkup(text = '') {
  const bare = String(text)
    .replace(/<\/?[pi][^>]*>/gi, '')
    .replace(/&nbsp;/gi, '')
    .trim()
  return bare.replace(/[.\s]/g, '').length === 0
}

/** The classic LiveJournal prefix: <p><i>8:13pm</i>. */
export function postPrefix(date = new Date()) {
  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const suffix = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12 || 12
  return `<p><i>${hours}:${minutes}${suffix}</i>. `
}
