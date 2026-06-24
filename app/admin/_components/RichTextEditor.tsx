"use client";
import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";
import { useMemo, useState, useRef, useEffect } from "react";
import { X, Code, Eye, Table } from "lucide-react";

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    const QuillInstance = RQ.Quill;
    
    // Register Table as a BlockEmbed with nested contenteditable cells to prevent optimizer flattening in Quill 1.x
    try {
      const BlockEmbed = QuillInstance.import("blots/block/embed");
      class TableBlot extends BlockEmbed {
        static create(value: any) {
          const node = super.create();
          let html = "";
          if (typeof value === "string") {
            html = value;
          } else if (value && typeof value === "object" && value.html) {
            html = value.html;
          }

          // Parse and unwrap outer table if nested
          if (html.startsWith("<table")) {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = html;
            const tableElem = tempDiv.querySelector("table");
            if (tableElem) {
              node.innerHTML = tableElem.innerHTML;
              Array.from(tableElem.attributes).forEach((attr) => {
                node.setAttribute(attr.name, attr.value);
              });
            } else {
              node.innerHTML = html;
            }
          } else {
            node.innerHTML = html;
          }

          node.setAttribute("contenteditable", "false");
          node.querySelectorAll("td, th").forEach((cell: any) => {
            cell.setAttribute("contenteditable", "true");
            if (!cell.style.border) {
              cell.style.border = "1px solid #e5e7eb";
            }
            if (!cell.style.padding) {
              cell.style.padding = "0.75rem 1rem";
            }
          });
          return node;
        }

        static value(node: any) {
          return node.outerHTML;
        }
      }
      TableBlot.blotName = "table";
      TableBlot.tagName = "table";
      QuillInstance.register(TableBlot, true);
    } catch {
      // silently ignore
    }

    const Component = ({ forwardedRef, ...props }: any) => <RQ ref={forwardedRef} {...props} />;
    Component.displayName = "ReactQuillWrapper";
    return Component;
  },
  { ssr: false }
);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  isFullScreen?: boolean;
  onCloseFullScreen?: () => void;
}

export default function RichTextEditor({
  value,
  onChange,
  isFullScreen = false,
  onCloseFullScreen,
}: RichTextEditorProps) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableHeader, setTableHeader] = useState(true);
  const quillRef = useRef<any>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);

  const setQuillRef = (el: any) => {
    if (el) {
      quillRef.current = el;
      setEditorInstance(el.getEditor());
    }
  };

  const [activeTableInfo, setActiveTableInfo] = useState<{
    tableNode: HTMLTableElement;
    rowNode: HTMLTableRowElement;
    cellNode: HTMLTableCellElement;
  } | null>(null);
  const [hoveredRow, setHoveredRow] = useState(0);
  const [hoveredCol, setHoveredCol] = useState(0);

  const handleSelectionChange = (range: any) => {
    // Check browser native selection first (for nested contenteditable elements inside table embed)
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      let cellNode: HTMLTableCellElement | null = null;
      let rowNode: HTMLTableRowElement | null = null;
      let tableNode: HTMLTableElement | null = null;
      
      let curr: any = selection.anchorNode;
      const editorRoot = editorInstance?.root;
      
      while (curr && curr !== editorRoot) {
        if (curr.nodeName === "TD" || curr.nodeName === "TH") {
          cellNode = curr;
        } else if (curr.nodeName === "TR") {
          rowNode = curr;
        } else if (curr.nodeName === "TABLE") {
          tableNode = curr;
          break;
        }
        curr = curr.parentNode;
      }
      
      if (tableNode && rowNode && cellNode) {
        setActiveTableInfo({ tableNode, rowNode, cellNode });
        return;
      }
    }

    // Fallback to Quill selection
    if (!editorInstance) return;

    if (!range) return;

    try {
      const [leaf] = editorInstance.getLeaf(range.index);
      if (!leaf) {
        setActiveTableInfo(null);
        return;
      }

      let parent = leaf.parent;
      let cellNode: HTMLTableCellElement | null = null;
      let rowNode: HTMLTableRowElement | null = null;
      let tableNode: HTMLTableElement | null = null;

      while (parent) {
        if (parent.statics.blotName === "td" || parent.statics.blotName === "th" || parent.domNode?.nodeName === "TD" || parent.domNode?.nodeName === "TH") {
          cellNode = parent.domNode;
        } else if (parent.statics.blotName === "tr" || parent.domNode?.nodeName === "TR") {
          rowNode = parent.domNode;
        } else if (parent.statics.blotName === "table" || parent.domNode?.nodeName === "TABLE") {
          tableNode = parent.domNode;
          break;
        }
        parent = parent.parent;
      }

      if (tableNode && rowNode && cellNode) {
        setActiveTableInfo({ tableNode, rowNode, cellNode });
      } else {
        setActiveTableInfo(null);
      }
    } catch {
      setActiveTableInfo(null);
    }
  };

  const handleTableAction = (action: string) => {
    if (!activeTableInfo) return;
    const { tableNode, rowNode, cellNode } = activeTableInfo;
    if (!editorInstance) return;

    editorInstance.focus();

    if (action === "addRowAbove" || action === "addRowBelow") {
      const newRow = document.createElement("tr");
      const cellTag = cellNode.tagName;
      const colCount = rowNode.cells.length;
      for (let i = 0; i < colCount; i++) {
        const newCell = document.createElement(cellTag);
        newCell.style.border = "1px solid #e5e7eb";
        newCell.style.padding = "0.75rem 1rem";
        newCell.innerHTML = "<br>";
        newCell.setAttribute("contenteditable", "true");
        newRow.appendChild(newCell);
      }
      if (action === "addRowAbove") {
        rowNode.parentNode?.insertBefore(newRow, rowNode);
      } else {
        rowNode.parentNode?.insertBefore(newRow, rowNode.nextSibling);
      }
    } else if (action === "deleteRow") {
      rowNode.remove();
      if (tableNode.rows.length === 0) {
        tableNode.remove();
      }
    } else if (action === "addColumnLeft" || action === "addColumnRight") {
      const cellIndex = Array.from(rowNode.cells).indexOf(cellNode);
      Array.from(tableNode.rows).forEach((row: any) => {
        const refCell = row.cells[cellIndex];
        if (refCell) {
          const cellTag = refCell.tagName;
          const newCell = document.createElement(cellTag);
          newCell.style.border = "1px solid #e5e7eb";
          newCell.style.padding = "0.75rem 1rem";
          newCell.innerHTML = "<br>";
          newCell.setAttribute("contenteditable", "true");
          if (action === "addColumnLeft") {
            row.insertBefore(newCell, refCell);
          } else {
            row.insertBefore(newCell, refCell.nextSibling);
          }
        }
      });
    } else if (action === "deleteColumn") {
      const cellIndex = Array.from(rowNode.cells).indexOf(cellNode);
      Array.from(tableNode.rows).forEach((row: any) => {
        const targetCell = row.cells[cellIndex];
        if (targetCell) {
          targetCell.remove();
        }
        if (row.cells.length === 0) {
          row.remove();
        }
      });
      if (tableNode.rows.length === 0) {
        tableNode.remove();
      }
    } else if (action === "deleteTable") {
      tableNode.remove();
    }

    editorInstance.update();
    setActiveTableInfo(null);
  };

  useEffect(() => {
    if (!editorInstance) return;

    const root = editorInstance.root;

    const checkTableSelection = () => {
      handleSelectionChange(editorInstance.getSelection());
    };

    const handleInput = (e: any) => {
      if (e.target.closest("table")) {
        editorInstance.update();
      }
      checkTableSelection();
    };

    root.addEventListener("click", checkTableSelection);
    root.addEventListener("keyup", checkTableSelection);
    root.addEventListener("input", handleInput);

    return () => {
      root.removeEventListener("click", checkTableSelection);
      root.removeEventListener("keyup", checkTableSelection);
      root.removeEventListener("input", handleInput);
    };
  }, [editorInstance]);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ font: [] }, { size: ["small", false, "large", "huge"] }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ script: "sub" }, { script: "super" }],
          ["blockquote", "code-block"],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
          ],
          [{ align: [] }],
          ["link", "image", "video"],
          ["clean"],
        ],
      },
    }),
    []
  );

  const insertTableHtmlDirectly = (rows: number, cols: number) => {
    let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin-bottom: 1.25em;">`;
    if (tableHeader) {
      tableHtml += "<tr>";
      for (let c = 1; c <= cols; c++) {
        tableHtml += `<th style="border: 1px solid #e5e7eb; padding: 0.75rem 1rem; font-weight: 700; background-color: #f9fafb; text-align: left;">Header ${c}</th>`;
      }
      tableHtml += "</tr>";
    }
    for (let r = 1; r <= rows; r++) {
      tableHtml += "<tr>";
      for (let c = 1; c <= cols; c++) {
        tableHtml += `<td style="border: 1px solid #e5e7eb; padding: 0.75rem 1rem; text-align: left;">Row ${r} Col ${c}</td>`;
      }
      tableHtml += "</tr>";
    }
    tableHtml += "</table><p><br></p>";

    if (isHtmlMode) {
      onChange(value + "\n" + tableHtml);
    } else {
      const quill = quillRef.current?.getEditor();
      if (quill) {
        quill.focus();
        const range = quill.getSelection();
        const position = range ? range.index : quill.getLength();
        quill.clipboard.dangerouslyPasteHTML(position, tableHtml);
        quill.setSelection(position + tableHtml.length);
      } else {
        onChange(value + "\n" + tableHtml);
      }
    }
    setShowTableModal(false);
    setHoveredRow(0);
    setHoveredCol(0);
  };

  const wrapperClass = isFullScreen
    ? "fixed inset-0 z-[60] bg-white p-3 md:p-5 flex flex-col"
    : "bg-white border border-gray-200 rounded-xl overflow-hidden p-3 flex flex-col relative";

  return (
    <div className={wrapperClass}>
      <div className="mb-2 flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {isHtmlMode ? "HTML Editor" : "Visual Editor"}
          </span>
          <button
            type="button"
            onClick={() => setIsHtmlMode(!isHtmlMode)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isHtmlMode ? (
              <>
                <Eye className="h-3.5 w-3.5 text-primary" /> Switch to Visual
              </>
            ) : (
              <>
                <Code className="h-3.5 w-3.5 text-primary" /> Switch to HTML / Code
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowTableModal(!showTableModal)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Table className="h-3.5 w-3.5 text-primary" /> Insert Table
          </button>
        </div>
        {isFullScreen && onCloseFullScreen && (
          <button
            type="button"
            onClick={onCloseFullScreen}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            <X className="h-4 w-4" /> Close
          </button>
        )}
      </div>

      {showTableModal && (
        <div className="absolute top-12 left-3 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-[240px] animate-fadeIn text-left">
          <div className="flex justify-between items-center mb-3">
            <h5 className="text-sm font-bold text-gray-900">Insert Table</h5>
            <button
              type="button"
              onClick={() => {
                setShowTableModal(false);
                setHoveredRow(0);
                setHoveredCol(0);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
              <input
                type="checkbox"
                checked={tableHeader}
                onChange={(e) => setTableHeader(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>Include Header Row</span>
            </label>

            {/* Interactive Grid Selector */}
            <div className="flex flex-col items-center p-2 border border-gray-100 rounded-xl bg-gray-50">
              <div 
                className="grid grid-cols-10 gap-0.5"
                onMouseLeave={() => {
                  setHoveredRow(0);
                  setHoveredCol(0);
                }}
              >
                {Array.from({ length: 10 }).map((_, rIdx) => {
                  const r = rIdx + 1;
                  return Array.from({ length: 10 }).map((_, cIdx) => {
                    const c = cIdx + 1;
                    const isHighlighted = r <= (hoveredRow || 0) && c <= (hoveredCol || 0);
                    return (
                      <div
                        key={`${r}-${c}`}
                        onMouseEnter={() => {
                          setHoveredRow(r);
                          setHoveredCol(c);
                        }}
                        onClick={() => insertTableHtmlDirectly(r, c)}
                        className={`w-4 h-4 rounded-[2px] cursor-pointer transition-all border ${
                          isHighlighted
                            ? "bg-primary border-primary scale-[1.05]"
                            : "bg-white border-gray-200 hover:border-primary/50"
                        }`}
                      />
                    );
                  });
                })}
              </div>
              <div className="mt-2 text-center text-[10px] font-bold text-gray-700">
                {hoveredRow > 0 && hoveredCol > 0 ? (
                  <span className="text-primary">{hoveredRow} x {hoveredCol} Table</span>
                ) : (
                  <span className="text-gray-400">Hover & click to insert</span>
                )}
              </div>
            </div>

            {/* Custom Inputs Fallback */}
            <div className="border-t border-gray-100 pt-2.5">
              <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Or enter size manually:</span>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-gray-600 font-bold mb-1">Rows</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={tableRows}
                    onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-bold mb-1">Cols</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tableCols}
                    onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => insertTableHtmlDirectly(tableRows, tableCols)}
                className="w-full py-1.5 bg-primary text-white rounded font-bold hover:bg-primary/95 transition-all text-[11px]"
              >
                Insert Custom Table
              </button>
            </div>
          </div>
        </div>
      )}

      {isHtmlMode ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full font-mono p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all ${
            isFullScreen ? "h-[calc(100vh-8rem)]" : "h-[22rem]"
          }`}
          placeholder="Paste or write your HTML content here (e.g. <table>...</table>)"
        />
      ) : (
        <>
          {activeTableInfo && (
            <div className="flex flex-wrap gap-1.5 p-2 bg-indigo-50 border border-gray-200 border-b-0 rounded-t-xl text-xs font-semibold text-gray-700 items-center animate-fadeIn relative z-10">
              <span className="text-[10px] uppercase font-extrabold text-primary tracking-wider mr-2 bg-white px-2 py-0.5 rounded shadow-sm border border-indigo-100">
                Table Actions
              </span>
              <button
                type="button"
                onClick={() => handleTableAction("addRowAbove")}
                className="px-2.5 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-50 text-gray-700 transition-colors shadow-sm hover:border-gray-300"
              >
                + Row Above
              </button>
              <button
                type="button"
                onClick={() => handleTableAction("addRowBelow")}
                className="px-2.5 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-50 text-gray-700 transition-colors shadow-sm hover:border-gray-300"
              >
                + Row Below
              </button>
              <button
                type="button"
                onClick={() => handleTableAction("deleteRow")}
                className="px-2.5 py-1 bg-red-50 border border-red-100 text-red-600 rounded-md hover:bg-red-100 hover:border-red-200 transition-colors shadow-sm"
              >
                - Delete Row
              </button>
              <div className="h-4 w-px bg-gray-200 mx-1" />
              <button
                type="button"
                onClick={() => handleTableAction("addColumnLeft")}
                className="px-2.5 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-50 text-gray-700 transition-colors shadow-sm hover:border-gray-300"
              >
                + Col Left
              </button>
              <button
                type="button"
                onClick={() => handleTableAction("addColumnRight")}
                className="px-2.5 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-50 text-gray-700 transition-colors shadow-sm hover:border-gray-300"
              >
                + Col Right
              </button>
              <button
                type="button"
                onClick={() => handleTableAction("deleteColumn")}
                className="px-2.5 py-1 bg-red-50 border border-red-100 text-red-600 rounded-md hover:bg-red-100 hover:border-red-200 transition-colors shadow-sm"
              >
                - Delete Col
              </button>
              <div className="h-4 w-px bg-gray-200 mx-1" />
              <button
                type="button"
                onClick={() => handleTableAction("deleteTable")}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors shadow-sm font-bold ml-auto"
              >
                Delete Table
              </button>
            </div>
          )}
          <ReactQuill
            forwardedRef={setQuillRef}
            theme="snow"
            value={value}
            onChange={onChange}
            onChangeSelection={handleSelectionChange}
            modules={modules}
            formats={[
              "font",
              "size",
              "header",
              "bold",
              "italic",
              "underline",
              "strike",
              "color",
              "background",
              "script",
              "blockquote",
              "code-block",
              "list",
              "indent",
              "align",
              "link",
              "image",
              "video",
              "table",
            ]}
            className={isFullScreen ? "h-[calc(100vh-8rem)]" : "h-[22rem]"}
          />
        </>
      )}
    </div>
  );
}
