import dayjs from "dayjs";

export const formatTime = value => {
  if (!value) {
    return "";
  }
  return dayjs(value).format("MMMM Do YYYY, h:mm:ss a");
};

export const roundOff = value => {
  if (!value) {
    return 0;
  }
  return Math.round(value * 100) / 100;
};

export const round = (number, precision) => {
  var shift = function(number, precision, reverseShift) {
    if (reverseShift) {
      precision = -precision;
    }
    var numArray = ("" + number).split("e");
    return +(
      numArray[0] +
      "e" +
      (numArray[1] ? +numArray[1] + precision : precision)
    );
  };
  return shift(Math.round(shift(number, precision, false)), precision, true);
};

export const arrayToSentence = (arr: string[] = []) => {
  if (!arr) return "";
  return arr
    .map((item: string, i) => {
      let str = item.charAt(0).toLowerCase() + item.slice(1);
      if (i === arr.length - 1) str += "";
      else if (i === arr.length - 2) str += " and ";
      else str += ", ";
      if (i === 0) str = item.charAt(0).toUpperCase() + str.slice(1);
      return str;
    })
    .join("");
};

export const pause = async (time = 10000): Promise<number> => {
  return new Promise(res => {
    setTimeout(() => res(time), time);
  });
};

export const isJson = obj => {
  return obj.constructor === {}.constructor;
};
