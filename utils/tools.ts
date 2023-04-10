import gradient from "gradient-string";
import picocolors from "picocolors";

export const orionGradient = (str: string) => {
  return process.stdout.isTTY && process.stdout.getColorDepth() > 8
    ? gradient([
        'rgb(165, 118, 249)',
        'rgb(219, 179, 237)'
      ])(str)
    : picocolors.magenta(str);
}