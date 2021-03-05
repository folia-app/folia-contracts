const controlCodes = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
};

const fgColors = {
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};
const bgColors = {
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
};

function colorize(fg: keyof typeof fgColors, bg?: keyof typeof bgColors) {
  return (tokens: TemplateStringsArray | string, ...values: any) => {
    const b = [fgColors[fg]];
    if (bg) {
      b.push(bgColors[bg]);
    }

    if (typeof tokens === "string") {
      b.push(tokens);
    } else {
      for (let i = 0; i < tokens.length - 1; i++) {
        b.push(tokens[i]);
        b.push(values[i]);
      }
      b.push(tokens[tokens.length - 1]);
    }
    b.push(controlCodes.reset);
    return b.join("");
  };
}

export const c = {
  red: colorize("red"),
  green: colorize("green"),
  yellow: colorize("yellow"),
  blue: colorize("blue"),
};
