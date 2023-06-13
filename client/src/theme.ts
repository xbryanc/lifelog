import color from "color";
import muiMakeStyles from "@material-ui/core/styles/makeStyles";
import {
  ClassNameMap,
  Styles,
  WithStylesOptions,
} from "@material-ui/core/styles/withStyles";
import { Overrides } from "@material-ui/core/styles/overrides";
import { createTheme, Theme, ThemeOptions } from "@material-ui/core/styles";

declare module "@material-ui/core/styles" {
  export function createTheme<TCustomTheme>(
    theme: ThemeOptions & TCustomTheme
  ): Theme & TCustomTheme;
}

declare module "@material-ui/core/styles/createTypography" {
  export interface TypographyUtils {
    htmlFontSize: number;
  }
}

type StylesHook<P extends {} = {}, C extends string = string> = (
  props?: P
) => ClassNameMap<C>;

export const Colors = {
  pink1: "#F6F5FA", // Lighter
  pink15: "#FBEAFB",
  pink30: "#EDCAED",
  pink50: "#DD45D3", // Darker
  periwinkle5: "#F0EFFE", // Lighter
  periwinkle25: "#DAD7FD",
  periwinkle50: "#B4AEFC",
  periwinkle75: "#8F86FA",
  periwinkle100: "#6A5DF9", // Darker
  shadow: "rgba(0, 0, 0, 0.3)",
  shadowLight: "rgba(0, 0, 0, 0.05)",
  coolGray05: "#F9FAFB",
  coolGray10: "#F3F4F6",
  coolGray20: "#E5E7EB",
  coolGray30: "#D1D5DB",
  coolGray40: "#9CA3AF",
  coolGray50: "#6B7280",
  coolGray60: "#4B5563",
  coolGray70: "#374151",
  coolGray80: "#1F2937",
  coolGray90: "#111827",
  black: "#000000",
  white: "#FFFFFF",
  yellow: "#FFCA28",
  gold: "#F8BB06",
  lightBlue: "#BBDEF2",
  blue: "#0076FF",
  coolBlue: "#943CFF",
  coolBlue05: "rgba(148, 60, 255, 0.05)",
  coolBlue10: "rgba(148, 60, 255, 0.10)",
  blue50: "#E1F5FE",
  blue900: "#01579B",
  lightGreen: "#C1EAD9",
  green: "#72CE7B",
  green50: "#F1F8F5",
  green400: "#55B989",
  green800: "#367C4F",
  green900: "#275C38",
  orange: "#F39212",
  red: "#EF3D57",
  red50: "#FFEBEE",
  red400: "#EF5350",
  red500: "#D84D4D",
  red800: "#C62828",
  red900: "#B71C1C",
  indigo50: "#F3F2FF",
  indigo900: "#1304B4",
  purple: "#6A5DF9",
  lightPurple: "#F3F2FF",
  neutral100: "#F3F4F6",
  teal500: "#00A4C3",
  neutral500: "#6B7280",
} as const;

export const theme = {
  typography: {
    fontSize: 14,
    lineHeight: 1.5,
    fontFamily: "var(--font-family)",
    fontFamilyMono: "var(--font-family-code)",
    title: {
      fontSize: 24,
      fontWeight: 500,
      margin: "unset",
    },
    h1: { fontSize: 28, fontWeight: 500, lineHeight: "36px" },
    h2: { fontSize: 24, fontWeight: 500, lineHeight: "32px" },
    h3: { fontSize: 20, fontWeight: 500, lineHeight: "28px" },
    h4: { fontSize: 18, fontWeight: 500, lineHeight: "26px" },
    h5: { fontSize: 16, fontWeight: 500, lineHeight: "24px" },
    body1: { fontSize: 14, lineHeight: "20px" },
    body2: { fontSize: 12, lineHeight: "18px" },
    subtitle1: { fontSize: 10, lineHeight: "16px" },
    subtitle: {
      fontSize: 12,
      opacity: 0.3,
      margin: "unset",
    },
    subtitle2: {
      fontSize: 14,
      opacity: 0.5,
      margin: "unset",
      fontWeight: 300,
    },
    ellipsis: {
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
    },
  },
  palette: {
    primary: {
      light: Colors.periwinkle25,
      main: Colors.periwinkle100,
      dark: color(Colors.periwinkle25).darken(0.2).toString(),
      contrastText: "#fff",
    },
    secondary: {
      light: "#fff",
      main: "#fff",
      dark: Colors.periwinkle25,
      contrastText: Colors.periwinkle75,
    },
    success: {
      light: color(Colors.green).lighten(0.2).toString(),
      main: Colors.green,
      dark: color(Colors.green).darken(0.2).toString(),
      contrastText: "#fff",
    },
    // same as primary
    info: {
      light: color(Colors.periwinkle25).lighten(0.2).toString(),
      main: Colors.periwinkle25,
      dark: color(Colors.periwinkle25).darken(0.2).toString(),
      contrastText: "#fff",
    },
    warning: {
      light: color(Colors.gold).lighten(0.2).toString(),
      main: Colors.gold,
      dark: color(Colors.gold).darken(0.2).toString(),
      contrastText: "#fff",
    },
    error: {
      light: color(Colors.red).lighten(0.2).toString(),
      main: Colors.red,
      dark: color(Colors.red).darken(0.2).toString(),
      contrastText: "#fff",
    },
    background: {
      primary: Colors.pink1,
      one: "#fff",
      two: Colors.coolGray05,
      three: Colors.coolGray50,
      gray: "#F9FAFB",
    },
  },
  colors: {
    ...Colors,
  },
  spacing: (n: number) => 8 * n,
  borderRadius: 8,
  zIndex: {
    layout: 10,
    low: 20, // Modals
    high: 30, // Modals over modals
    aboveLeaflet: 600, // Leaflet map overlays, leaflet uses ~400 internally
    workflows: 630,
  },
  duration: {
    short: 250,
    medium: 500,
    long: 1000,
  },
  containers: {
    borderRadius: {
      small: 4,
      medium: 8,
      large: 16,
    },
    depth1: "inset 0px -1px 0px rgba(0, 0, 0, 0.1)",
    elevation0: "0px 0px 4px rgba(17, 24, 39, 0.1)",
    elevation1:
      "0px 2px 4px rgba(0, 0, 0, 0.1), 0px 0px 4px rgba(0, 0, 0, 0.1)",
    elevation2: "0px 0px 4px rgba(17, 24, 39, 0.1)",
    marginRightForElevation: "2px", // this fixes box getting cut off when using boxShadow with elevation1
    border: "1px solid rgba(0, 0, 0, 0.1)",
    padding: "0 24px",
    sidebarPadding: "0 20px",
    filterSidebarPadding: "0 16px 0 0",
    separator: {
      paddingBottom: 16,
      marginBottom: 16,
      borderBottom: "1px solid #E6E6E6",
    },
  },
  alignment: {
    verticalCenter: {
      top: "50%",
      transform: "translate(0, -50%)",
    },
    inset: {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
  },
  sizes: {
    topBarHeight: 64,
    announcementHeight: 18,
    drawerWidth: 280,
    drawerWidthExtraLong: 1200,
    drawerWidthLong: 300,
    drawerSmallWidth: 64,
    openFooterHeight: 205,
  },
  utils: {
    resetList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
  },
  interactions: {
    borderLeftHighlight: {
      position: "relative",
      transition: "all 250ms ease-out",
      "&:before": {
        content: "' '",
        background: Colors.periwinkle100,
        width: 4,
        borderRadius: "0 2px 2px 0",
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        transform: "translate3d(-4px, 0, 0)",
        transition: "all 250ms ease-out",
      },
    },
    borderLeftHighlightHover: {
      color: Colors.periwinkle100,
      "&:before": {
        transform: "translate3d(0, 0, 0)",
      },
    },
    borderBottomGrow: {
      position: "relative",
      "&:before": {
        content: '" "',
        background: Colors.periwinkle100,
        position: "absolute",
        height: 2,
        bottom: -2,
        left: 0,
        right: 0,
        transform: "scale(0, 1)",
        transformOrigin: "left bottom",
        transition: `transform 250ms ease-out`,
      },
    },
    borderBottomGrowHover: {
      "&:before": {
        transform: "scale(1, 1)",
      },
    },
  },
  lightCard: {
    padding: 16,
    border: "solid 1px var(--color-RemoGray10)",
    borderRadius: 8,
  },
  contentContainer: {
    padding: 16,
  },
  hideScrollbar: {
    /* Hide scrollbar for Chrome, Safari and Opera */
    "&::-webkit-scrollbar": {
      display: "none",
    },
    "-ms-overflow-style": "none" /* IE and Edge */,
    scrollbarWidth: "none" /* Firefox */,
  },
  rapidButton: {
    root: {
      borderRadius: 8,
      padding: "4px 16px !important",
      letterSpacing: 0,

      "&.MuiButton-contained.Mui-disabled": {
        backgroundColor: `${Colors.periwinkle100} !important`,
        opacity: 0.3,
        color: "white !important",
      },
    },
    label: {
      textTransform: "none",
      fontSize: 14,
      fontWeight: 500,
    },
    contained: {
      boxShadow: "none !important",
      fontWeight: 500,
    },
  },
  validatorParamsBuilder: {
    display: "flex",
    flexDirection: "column",
    borderLeft: `1px solid ${Colors.coolGray20}`,
    "&:last-child": {
      borderBottom: "0",
    },
  },
} as const;

export function makeStyles<
  Props extends {} = {},
  ClassKey extends string = string
>(
  styles: Styles<typeof theme, Props, ClassKey>,
  options?: Omit<WithStylesOptions<typeof theme>, "withTheme">
) {
  return muiMakeStyles<typeof theme, Props, ClassKey>(
    styles,
    options
  ) as StylesHook<Props, ClassKey>;
}
