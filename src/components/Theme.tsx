import { createTheme } from "@mui/material/styles";

export const MyTheme = createTheme({
  components: {
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
            backgroundColor: "#3DEDE8", // ホバー時に適用したい背景色
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
