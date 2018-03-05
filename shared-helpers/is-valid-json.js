module.exports = function isValidJSON(value) {
  try {
    if (value !== '\'\'') {
      JSON.parse(value);
    }
    return true;
  } catch (e) {
    // Sit on the error bc we only care that it was or was not valid JSON
    return false;
  }
}