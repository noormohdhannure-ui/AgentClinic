// Route pattern for numeric ids: no leading zero, at most nine digits. Ids
// like "abc", "0", "01", "1.5", "-1", or "1e3" don't match, so they fall
// through to the 404 page.
export const ID = "{[1-9][0-9]{0,8}}";
