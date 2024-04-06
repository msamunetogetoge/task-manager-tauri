import { createTheme } from "@mui/material/styles";

export const MyTheme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        // containedバリアントのスタイル
        contained: {
          backgroundColor: "#087D75", // 例: ボタンの背景色
          color: "#FFFFFF", // 例: ボタンの文字色
          "&:hover": {
            backgroundColor: "#089A9A", // 例: ホバー時の背景色
          },
        },
        // outlinedバリアントのスタイル
        outlined: {
          color: "#0ABAB5", // ボタンのテキストとボーダーの色
          border: "1px solid #0ABAB5",
          "&:hover": {
            backgroundColor: "rgba(10, 186, 181, 0.1)", // ホバー時の背景色を薄く
            // backgroundColor: "rgba(158, 246, 243, 0.1)", // ホバー時の背景色を薄く
            borderColor: "#089A9A", // ホバー時には少し濃い色に変更
            // 注意: backgroundColorの透明度を調整することで、望む効果を得られます。
            // rgba(10, 186, 181, 0.04)は非常に薄い背景色です。必要に応じて調整してください。
          },
        },
      },
    },

    MuiTable: {
      styleOverrides: {
        // テーブル全体にボーダーを適用
        root: {
          border: "1px solid #CCCCCC", // ボーダーの色と太さ
        },
      },
    },
    // MuiTableBodyコンポーネントのカスタマイズ
    MuiTableBody: {
      styleOverrides: {
        // MuiTableBody内のMuiTableRowに対するスタイル
        root: {
          // MuiTableRowがホバーされた時のスタイル
          "tr:hover": {
            backgroundColor: "rgba(158, 246, 243, 0.1)", // ホバー時に適用したい背景色
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#0ABAB5", // ヘッダーの背景色
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          // ここでヘッダーセルを指定
          color: "#FFFFFF", // 文字色を白に設定
        },
      },
    },
  },
});
