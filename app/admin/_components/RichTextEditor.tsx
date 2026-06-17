"use client";
import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { X } from "lucide-react";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

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

  const wrapperClass = isFullScreen
    ? "fixed inset-0 z-[60] bg-white p-3 md:p-5"
    : "bg-white border border-gray-200 rounded-xl overflow-hidden";

  return (
    <div className={wrapperClass}>
      {isFullScreen && (
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Full Screen Editor</p>
          <button
            type="button"
            onClick={onCloseFullScreen}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <X className="h-4 w-4" /> Close
          </button>
        </div>
      )}
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
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
        ]}
        className={isFullScreen ? "h-[calc(100vh-7rem)]" : "h-[22rem]"}
      />
    </div>
  );
}
