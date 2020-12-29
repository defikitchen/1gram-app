export const randomArray = (arr: any[]) => {
  let words = [...arr];
  let i = words.length,
    temporaryValue,
    randomIndex;
  while (0 !== i) {
    randomIndex = Math.floor(Math.random() * i);
    i -= 1;
    temporaryValue = words[i];
    words[i] = words[randomIndex];
    words[randomIndex] = temporaryValue;
  }

  return words;
};
