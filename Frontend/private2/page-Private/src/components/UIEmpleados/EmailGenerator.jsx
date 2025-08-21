export const generateEmail = (name, lastName) => {
  if (name && lastName) {
    return `${name.toLowerCase()}.${lastName.toLowerCase()}@rivera.com`;
  }
  return '';
};