"use client";

// npx shadcn-ui@latest add checkbox
// npm  i react-use-measure
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { LocateFixed, Navigation, Trash } from "lucide-react";
import {
  AnimatePresence,
  LayoutGroup,
  Reorder,
  motion,
  useDragControls,
} from "motion/react";
import useMeasure from "react-use-measure";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

export type Item = {
  text: string;
  checked: boolean;
  id: number;
  link: string;
};

interface SortableListItemProps {
  item: Item;
  order: number;
  onCompleteItem: (id: number) => void;
  onDeleteItem: (id: string) => void;
  renderExtra?: (item: Item) => React.ReactNode;
  isExpanded?: boolean;
  className?: string;
  handleDrag: () => void;
}

function SortableListItem({
  item,
  order,
  onCompleteItem,
  onDeleteItem,
  renderExtra,
  handleDrag,
  isExpanded,
  className,
}: SortableListItemProps) {
  let [ref, bounds] = useMeasure();
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggable, setIsDraggable] = useState(true);
  const dragControls = useDragControls();

  const handleDragStart = (event: any) => {
    setIsDragging(true);
    dragControls.start(event, { snapToCursor: true });
    handleDrag();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <motion.div className={cn("", className)} key={item.id}>
      <div className="flex w-full items-center">
        <Reorder.Item
          value={item}
          className={cn(
            "relative z-auto grow",
            "h-full rounded-xl bg-main-background-300",
            "shadow-[0px_1px_0px_0px_hsla(0,0%,100%,.03)_inset,0px_0px_0px_1px_hsla(0,0%,100%,.03)_inset,0px_0px_0px_1px_rgba(0,0,0,.1),0px_2px_2px_0px_rgba(0,0,0,.1),0px_4px_4px_0px_rgba(0,0,0,.1),0px_8px_8px_0px_rgba(0,0,0,.1)]",
            item.checked ? "cursor-not-allowed" : "cursor-grab",
            item.checked && !isDragging ? "w-7/10" : "w-full",
          )}
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            height: bounds.height > 0 ? bounds.height : undefined,
            transition: {
              type: "spring",
              bounce: 0,
              duration: 0.4,
            },
          }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.05,
              type: "spring",
              bounce: 0.1,
            },
          }}
          layout
          layoutId={`item-${item.id}`}
          dragListener={!item.checked}
          dragControls={dragControls}
          onDragEnd={handleDragEnd}
          style={
            isExpanded
              ? {
                  zIndex: 9999,
                  marginTop: 10,
                  marginBottom: 10,
                  position: "relative",
                  overflow: "hidden",
                }
              : {
                  position: "relative",
                  overflow: "hidden",
                }
          }
          whileDrag={{ zIndex: 9999 }}
        >
          <div ref={ref} className={cn(isExpanded ? "" : "", "z-20 ")}>
            <motion.div
              layout="position"
              className="flex items-center justify-start px-32 py-4"
            >
              <AnimatePresence>
                {!isExpanded ? (
                  <motion.div
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.001 }}
                    className="flex items-center space-x-2 "
                  >
                    <Link
                      className="flex text-main-text-200 items-center p-4"
                      href={`/auth/dashboard/requests/read/${item.link}`}
                    >
                      <LocateFixed />
                    </Link>
                    {/* List Remove Actions */}
                    <Checkbox
                      checked={item.checked}
                      id={`checkbox-${item.id}`}
                      aria-label="Mark to delete"
                      onCheckedChange={() => onCompleteItem(item.id)}
                      className=" ml-3 h-5 w-5 rounded-md border-white/20 bg-black/30 data-[state=checked]:bg-black data-[state=checked]:text-red-200"
                    />
                    {/* List Order */}
                    <p className="font-mono text-xs pl-1">{order + 1}</p>

                    {/* List Title */}
                    <motion.div
                      key={`${item.checked}`}
                      className=" px-1 min-w-[150px]"
                      initial={{
                        opacity: 0,
                        filter: "blur(4px)",
                      }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      transition={{
                        bounce: 0.2,
                        delay: item.checked ? 0.2 : 0,
                        type: "spring",
                      }}
                    >
                      <h4
                        className={cn(
                          "tracking-tighter text-base md:text-lg ",
                          item.checked ? "text-red-400" : "text-main-text-100",
                        )}
                      >
                        {item.checked ? "Delete" : ` ${item.text}`}
                      </h4>
                    </motion.div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* List Item Children */}
              {renderExtra && renderExtra(item)}
            </motion.div>
          </div>
          <div
            onPointerDown={isDraggable ? handleDragStart : undefined}
            style={{ touchAction: "none" }}
          />
        </Reorder.Item>
        {/* List Delete Action Animation */}
        <AnimatePresence mode="popLayout">
          {item.checked ? (
            <motion.div
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity: 1,
                x: 0,
                transition: {
                  delay: 0.17,
                  duration: 0.17,
                  type: "spring",
                  bounce: 0.6,
                },
                zIndex: 5,
              }}
              exit={{
                opacity: 0,
                x: -5,
                transition: {
                  delay: 0,
                  duration: 0.0,
                  type: "spring",
                  bounce: 0,
                },
              }}
              className="-ml-[1px] h-[1.5rem] w-3 rounded-l-none  rounded-r-none border-y  border-y-white/5 border-r-white/10 bg-main-background-300 "
            />
          ) : null}
        </AnimatePresence>
        <AnimatePresence mode="popLayout">
          {item.checked ? (
            <motion.div
              layout
              initial={{ opacity: 0, x: -5, filter: "blur(4px)" }}
              animate={{
                opacity: 1,
                x: 0,
                filter: "blur(0px)",
                transition: {
                  delay: 0.3,
                  duration: 0.15,
                  type: "spring",
                  bounce: 0.9,
                },
              }}
              exit={{
                opacity: 0,
                filter: "blur(4px)",
                x: -10,
                transition: { delay: 0, duration: 0.12 },
              }}
              className="inset-0 z-0 border-spacing-1  rounded-r-xl rounded-l-sm border-r-2   border-r-red-300/60 bg-main-background-300 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_0_0_1px_rgba(255,255,255,0.03)_inset,0_0_0_1px_rgba(0,0,0,0.1),0_2px_2px_0_rgba(0,0,0,0.1),0_4px_4px_0_rgba(0,0,0,0.1),0_8px_8px_0_rgba(0,0,0,0.1)] dark:bg-[#161716]/50"
            >
              <button
                className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium  transition-colors duration-150   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => onDeleteItem(item.link)}
              >
                <Trash className="h-4 w-4 text-red-400 transition-colors duration-150 fill-red-400/60 " />
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

SortableListItem.displayName = "SortableListItem";

interface SortableListProps {
  items: Item[];
  setItems: Dispatch<SetStateAction<Item[]>>;
  onCompleteItem: (id: number) => void;
  renderItem: (
    item: Item,
    order: number,
    onCompleteItem: (id: number) => void,
    onDeleteItem: (link: string) => void,
  ) => ReactNode;
  deleteItem: (link: string) => void;
}

function SortableList({
  items,
  setItems,
  onCompleteItem,
  renderItem,
  deleteItem,
}: SortableListProps) {
  if (items) {
    return (
      <LayoutGroup>
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={setItems}
          className="flex flex-col"
        >
          <AnimatePresence>
            {items?.map((item, index) =>
              renderItem(item, index, onCompleteItem, deleteItem),
            )}
          </AnimatePresence>
        </Reorder.Group>
      </LayoutGroup>
    );
  }
  return null;
}

SortableList.displayName = "SortableList";

export { SortableList, SortableListItem };
