import { useEffect, useRef } from "react";
import "./App.css";

function App() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef("");
  const delNodesRef = useRef<any[]>([]);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const enterHandler = (e: DragEvent) => {
      e.preventDefault();
    };
    const overHandler = (e: DragEvent) => {
      e.preventDefault();
    };
    const dropHandler = (e: DragEvent) => {
      e.preventDefault();
      const fileList = e.dataTransfer?.files;
      if (!fileList || fileList.length === 0) return;
      const file = fileList[0];
      if (file.type !== "image/svg+xml") return;

      const fileName = file.name;
      nameRef.current = fileName.slice(0, fileName.length - 4);
      const reader = new FileReader();
      reader.onload = () => {
        wrapperRef.current!.innerHTML = reader.result as string;
      };
      reader.readAsText(file);
    };

    const clickHandler = (e: MouseEvent) => {
      const target = e.target;
      if (target && target !== wrapperRef.current) {
        // @ts-ignore
        const parent = target.parentElement;
        const children = parent.children;
        let nextSibling;
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (child === target) {
            nextSibling = children[i + 1];
            break;
          }
        }
        parent.removeChild(target);
        delNodesRef.current.push({
          node: target,
          parent,
          next: nextSibling,
        });
      }
    };

    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === "z" && e.ctrlKey) {
        const lastNode = delNodesRef.current.pop();
        if (lastNode) {
          const { parent, next, node } = lastNode;
          if (next) {
            parent.insertBefore(node, next);
          } else {
            parent.appendChild(node);
          }
        }
      }
    };

    const parent = wrapperRef.current;
    parent.addEventListener("dragenter", enterHandler);
    parent.addEventListener("dragover", overHandler);
    parent.addEventListener("drop", dropHandler);
    parent.addEventListener("click", clickHandler);
    document.addEventListener("keydown", keyDownHandler);

    return () => {
      parent.removeEventListener("dragenter", enterHandler);
      parent.removeEventListener("dragover", overHandler);
      parent.removeEventListener("drop", dropHandler);
      parent.removeEventListener("click", clickHandler);
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, []);

  const clickHandle = () => {
    const svgNodes = wrapperRef.current?.children;
    if (!svgNodes || svgNodes.length === 0) return;
    const svgNode = svgNodes[0];
    const canvas = document.createElement("canvas");
    canvas.width = svgNode.clientWidth;
    canvas.height = svgNode.clientHeight;
    const svgXml = new XMLSerializer().serializeToString(svgNode);
    const img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(svgXml);
    img.onload = () => {
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = nameRef.current + ".png";
      a.click();
      delNodesRef.current = [];
    };

    // const canvas = document.querySelector("canvas");
    // if (!canvas) return;
    // const dataUrl = canvas.toDataURL("image/png");
    // const a = document.createElement("a");
    // a.href = dataUrl;
    // a.download = "test.png";
    // a.click();
  };

  return (
    <div className="App">
      <button onClick={clickHandle}>导出为png图片</button>
      <div ref={wrapperRef} style={{ height: "90vh" }} />
    </div>
  );
}

export default App;
