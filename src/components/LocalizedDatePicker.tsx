import React, { useState, useRef, MouseEvent } from "react";
import Calendar from "./Calendar";
import Popover from "@mui/material/Popover";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import IconButton from "@mui/material/IconButton";

import { TextField } from "@mui/material";

// Propsの型定義
interface LocalizedDatePickerProps {
  label?: string;
  disableFuture?: boolean;
  disableFutureDate?: Date;
  onChange: (newDate: Date | null) => void;
  value?: string | Date | null;
  disabled?: boolean;
}

const LocalizedDatePicker: React.FC<LocalizedDatePickerProps> = ({
  label,
  disableFuture,
  disableFutureDate: disableFutureDateProp,
  onChange,
  value,
  disabled,
}) => {
  const disableFutureDate = disableFuture
    ? disableFutureDateProp || new Date()
    : null;
  const selectedValue = value || null;

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const controlRef = useRef<HTMLDivElement>(null);

  // const INPUT_ID = `LocalizedDatePicker_OutlinedInput_${generateUUID()}`;

  const handleControlClick = (e: MouseEvent<HTMLDivElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  // const POPOVER_ID = open ? `LocalizedDatePicker_Popover_${generateUUID()}` : undefined;

  const handleDateChange = (newDate: Date | null) => {
    setAnchorEl(null);
    onChange(newDate);
  };

  const disableDateFunction = (date: Date) => {
    // 指定の日付より未来の場合は選択不可
    if (disableFutureDate && date.getTime() > disableFutureDate.getTime()) {
      return true;
    }
    return false;
  };

  const handleInputDateClear = (e: any) => {
    e.stopPropagation();
    onChange(null);
  };

  let cal = selectedValue ? new Calendar(selectedValue) : null;
  const displayDate: string = cal ? cal.format("Y/m/d(W)") : ""; // 表示用日付文字列

  return (
    <div
      className="LocalizedDatePicker"
      style={{ position: "relative", minWidth: "10rem" }}
    >
      <div style={{ position: "relative" }} ref={controlRef}>
        <TextField
          onClick={handleControlClick}
          fullWidth
          label={label}
          disabled={disabled}
          // id={INPUT_ID}
          value={displayDate}
          inputProps={{ sx: { cursor: "pointer" } }}
          InputProps={{
            readOnly: true,
            sx: {
              paddingRight: "0",
              paddingLeft: "0",
              width: "100%",
              // height: "2.5rem",
              fontSize: "0.9375rem",
              cursor: "pointer",
            },
            endAdornment: (
              <IconButton
                sx={{
                  visibility:
                    !disabled && displayDate !== "" ? "visible" : "hidden",
                }}
                onClick={handleInputDateClear}
              >
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 -960 960 960"
                    width="24"
                  >
                    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                  </svg>
                </span>
              </IconButton>
            ),
          }}
        />
      </div>

      <Popover
        // id={POPOVER_ID}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <DateCalendar
          value={cal ? cal.getObject() : null}
          onChange={handleDateChange}
          shouldDisableDate={disableDateFunction}
        />
      </Popover>
    </div>
  );
};

export default LocalizedDatePicker;
