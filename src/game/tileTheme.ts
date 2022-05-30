interface TileTheme {
  backgroundColor: string; 
  textColor: string
}

interface Theme {
  "other": TileTheme;
  [key: number]: TileTheme;
}

const theme: Theme = {
  "other": {
    backgroundColor: "hsla(220, 60%, 20%, 0.9)",
    textColor: "white"
  },
  2: {
    backgroundColor: "hsla(220, 60%, 80%, 0.9)",
    textColor: "white"
  },
  4: {
    backgroundColor: "hsla(220, 60%, 74%, 0.9)",
    textColor: "white"
  },
  8: {
    backgroundColor: "hsla(220, 60%, 68%, 0.9)",
    textColor: "white"
  },
  16: {
    backgroundColor: "hsla(220, 60%, 62%, 0.9)",
    textColor: "white"
  },
  32: {
    backgroundColor: "hsla(220, 60%, 56%, 0.9)",
    textColor: "white"
  },
  64: {
    backgroundColor: "hsla(220, 60%, 50%, 0.9)",
    textColor: "white"
  },
  128: {
    backgroundColor: "hsla(220, 60%, 44%, 0.9)",
    textColor: "white"
  },
  256: {
    backgroundColor: "hsla(220, 60%, 38%, 0.9)",
    textColor: "white"
  },
  512: {
    backgroundColor: "hsla(220, 60%, 32%, 0.9)",
    textColor: "white"
  },
  1024: {
    backgroundColor: "hsla(220, 60%, 26%, 0.9)",
    textColor: "white"
  },
  2048: {
    backgroundColor: "hsla(220, 60%, 20%, 0.9)",
    textColor: "white"
  }
}

export const getTileBackgroundColor = (tileValue: number) => {
  return theme.hasOwnProperty(tileValue) ? 
    theme[tileValue].backgroundColor : 
    theme["other"].backgroundColor;
}

export const getTileTextColor = (tileValue: number) => {
  return theme.hasOwnProperty(tileValue) ? 
    theme[tileValue].textColor : 
    theme["other"].textColor;
}