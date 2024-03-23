import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";
import { useEffect, useRef, useState } from "react";
import isEqual from "lodash/isEqual";

/**
 * ALL付きのマルチセレクトを作るときに使うカスタムフック.allItemがdisplayItemに含まれていることが前提
 * 1. 最初はinitialSelectionが選択されている状態
 * 2. どれか一つを選択したらALLのチェックは外れる
 * 3. ALLを選択したら、ALL以外の全てのチェックが外れる
 * 4. 項目は、必ず一つ選択
 * @param displayItem 表示したい全データ
 * @param initialSelection 初期値
 * @param allItem  全ての項目を選択する項目
 * @param allowZeroSelect 項目を0個にすることを許可するかどうか
 * @param allItemSelected 全ての項目が選択された時の値
 * @returns selectedItem, setSelectedItemState, setSelectedItem の3つの値を返す
 * @example
 * const { selectedItem, setSelectedItemState, setSelectedItem } = useMultiSelect(DISPLAY_ITEM, ["ALL"], "ALL"); // 初期化
 * const handleChange =(e:T)=>{setSelectedItem(e)}; // selectedItemがよしなに更新される
 * const setInitialSelection = (e:T[])=>{setSelectedItemState(e)}; // 特別に初期値を変更したいときはこれで初期値を設定する
 */
export default function useMultiSelect<T>(
  displayItem: T[],
  initialSelection: T[],
  allItem: T,
  allowZeroSelect: boolean = false,
  allItemSelected: T[] = [allItem]
) {
  const [selectedItem, setSelectedItemState] = useState<T[]>(initialSelection);

  // ALLを除外
  const excludeAll = (items: T[]) => items.filter((v) => !isEqual(v, allItem));
  // 項目を追加
  const addItem = (items: T[], item: T) => [...items, item];
  // 項目を削除
  const removeItem = (items: T[], item: T) =>
    items.filter((v) => !isEqual(v, item));

  // 選択済みの項目を更新
  const setSelectedItem = (item: T) => {
    // ALLが選択された場合
    if (isEqual(item, allItem)) {
      if (allowZeroSelect && isEqual(selectedItem, allItemSelected)) {
        setSelectedItemState([]);
        return;
      } else {
        setSelectedItemState(allItemSelected);
        return;
      }
    }

    // ALL以外が選択された場合
    let updatedDisplayItem = selectedItem.some((v) => isEqual(v, allItem))
      ? excludeAll(selectedItem)
      : [...selectedItem];
    if (!selectedItem.some((v) => isEqual(v, item))) {
      updatedDisplayItem = addItem(updatedDisplayItem, item);
      // 全ての項目が選択された場合
      if (updatedDisplayItem.length >= displayItem.length - 1) {
        updatedDisplayItem = allItemSelected;
      }
    } else {
      // 項目が二つ以上ある時のみ、項目を削除する
      if (allowZeroSelect || updatedDisplayItem.length > 1) {
        updatedDisplayItem = removeItem(updatedDisplayItem, item);
      }
    }
    setSelectedItemState(updatedDisplayItem);
  };

  return {
    selectedItem,
    setSelectedItemState,
    setSelectedItem,
  };
}

type WithFormatter<T> = T extends string
  ? { formatter: never }
  : { formatter: (item: T) => string };

type MultiSelectComponentProps<T> = {
  label: string;
  getName: (item: T) => string;
  displayItems: T[]; // `displayItem` を `displayItems` に変更して明確にする
  initialSelection: T[];
  allItemSelected?: T[];
  allItem: T;
  onChange: (selectedItems: T[]) => void;
  formatter: WithFormatter<T>;
};

/**
 * マルチセレクトコンポーネント
 * @param label ラベル
 * @param getName 項目の名前を取得する関数
 * @param displayItems 表示したい全データ
 * @param initialSelection 初期値
 * @param allItem 全ての項目を選択する項目
 * @param onChange 選択された項目が変更された時に呼び出される関数
 * @param formatter keyを設定するための関数
 * @param allItemSelected 全ての項目が選択された時の値
 * @returns
 */
export function MultiSelectComponent<T>({
  label,
  getName,
  displayItems,
  initialSelection,
  allItem,
  onChange,
  formatter,
  allItemSelected = [allItem],
}: MultiSelectComponentProps<T>) {
  // ポップオーバー開閉
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // ポップオーバー表示位置のref
  const itemSelectRef = useRef(null);

  const { selectedItem, setSelectedItem } = useMultiSelect(
    displayItems,
    initialSelection,
    allItem,
    undefined,
    allItemSelected
  );

  useEffect(() => {
    onChange(selectedItem);
  }, [selectedItem]);

  const handleSelectItemChange = (item: T) => {
    setSelectedItem(item); // ここでonChangeを呼び出すと、更新が反映される前に呼び出されてしまう
  };

  const handleShowItemMenu = (_: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(itemSelectRef.current);
  };
  const handleCloseItemMenu = () => {
    setAnchorEl(null);
  };

  const isAllItemSelection = (items: T[]) => {
    if (items.length !== allItemSelected.length) return false;

    for (let i = 0; i < items.length; i++) {
      if (!isEqual(items[i], allItemSelected[i])) return false;
    }
    return true;
  };

  return (
    <>
      <Button
        onClick={handleShowItemMenu}
        ref={itemSelectRef}
        variant={isAllItemSelection(selectedItem) ? "outlined" : "contained"}
      >
        <Tooltip
          title={selectedItem
            .map((item) => getName(item))
            .join(", ")
            .replace(`${getName(allItem)}, `, "")}
        >
          <span>{label}</span>
        </Tooltip>
      </Button>

      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        open={Boolean(anchorEl)}
        onClose={handleCloseItemMenu}
        sx={{ maxHeight: "20rem" }}
      >
        <FormGroup>
          {displayItems.map((item) => (
            <FormControlLabel
              key={typeof item === "string" ? item : formatter.formatter(item)}
              value={item}
              control={
                <Checkbox
                  onChange={() => handleSelectItemChange(item)}
                  checked={selectedItem.some((v) => isEqual(v, item))}
                />
              }
              label={getName(item)}
              sx={{
                display: "block",
                margin: "0",
                padding: "0.375rem 1rem",
                backgroundColor:
                  selectedItem.indexOf(item) > -1
                    ? "rgba(0, 116, 240, 0.08)"
                    : "none",
                ":hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
              }}
            />
          ))}
        </FormGroup>
      </Popover>
    </>
  );
}
