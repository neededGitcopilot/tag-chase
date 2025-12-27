import React, { useEffect, useRef, useState } from "react";

const Grid = () => {
  const totalGrids = 25;
  const parentRef = useRef(null);
  const [boxSize, setBoxSize] = useState(0);

  useEffect(() => {
    if (parentRef.current) {
      const { width, height } = parentRef.current.getBoundingClientRect();
      setBoxSize(Math.min(width / totalGrids, height / totalGrids));
    }
  }, []);

  return (
    <main>
      <p className="text-center text-[24px] text-[#252525] font-bold">TAG & CHASE</p>
      <section
      ref={parentRef}
      className="flex items-center justify-center w-full h-full"
    >
      {boxSize > 0 && (
        <div
          className="grid border border-gray-600 rounded-lg overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${totalGrids}, ${boxSize}px)`,
            gridTemplateRows: `repeat(${totalGrids}, ${boxSize}px)`,
            width: boxSize * totalGrids,
            height: boxSize * totalGrids,
          }}
        >
          {Array.from({ length: totalGrids * totalGrids }).map((_, index) => (
            <div
              key={index}
              className="border border-gray-300 box-border"
            />
          ))}
        </div>
      )}
    </section>
    </main>
  );
};

export default Grid;
