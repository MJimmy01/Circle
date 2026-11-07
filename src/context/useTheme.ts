import { useContext } from "react";
import { ThemeContext } from "./themeContextDef";

export const useTheme = () => useContext(ThemeContext);

