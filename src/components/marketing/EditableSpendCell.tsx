import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface EditableSpendCellProps {
  spend: number;
  manualSpend: number | undefined;
  onSave: (value: number) => void;
  children: React.ReactNode;
}

const EditableSpendCell = ({ spend, manualSpend, onSave, children }: EditableSpendCellProps) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const isMissing = spend === 0 && manualSpend === undefined;

  const commit = () => {
    const parsed = parseFloat(inputValue.replace(",", "."));
    if (!isNaN(parsed) && parsed >= 0) {
      onSave(parsed);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        className="h-7 w-24 text-xs px-2"
        placeholder="€ ..."
      />
    );
  }

  if (isMissing) {
    return (
      <button
        onClick={() => { setInputValue(""); setEditing(true); }}
        className="text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded px-2 py-0.5 text-xs cursor-pointer hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors font-medium"
      >
        In te vullen
      </button>
    );
  }

  return <>{children}</>;
};

export default EditableSpendCell;
